import { pipeline, TextStreamer } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

const MODEL = "onnx-community/Qwen3-0.6B-DQ-ONNX";
let generator = null;
let messages = [];
let mode = "Assistente";
const $ = id => document.getElementById(id);

const systemBase = "Você é o Teacher Marcelo AI, um assistente útil e objetivo. Responda em português brasileiro por padrão. Ajude com ensino de inglês, CEFR A0-C2, lesson plans, exercícios, roteiros para YouTube e programação. Não invente fatos. Quando o usuário pedir conteúdo educacional, entregue material prático e organizado.";
const modePrompts = {
"Assistente":"Atue como assistente geral.",
"Professor de Inglês":"Atue como professor de inglês especializado em CEFR A0-C2. Inclua exemplos e respostas quando apropriado.",
"Roteirista":"Atue como roteirista de YouTube em português brasileiro. Priorize clareza, narrativa e retenção, entregando texto pronto para narração.",
"Lesson Plan":"Crie lesson plans completos e aplicáveis, com objetivos, warm-up, vocabulário, prática, produção, exercícios e answer key quando solicitado.",
"Programador":"Atue como programador. Forneça soluções funcionais, explique mudanças e não invente credenciais."
};

function setStatus(t){$("status").textContent=t}
function addMessage(role,text){
 const welcome=$("welcome"); if(welcome) welcome.remove();
 const wrap=document.createElement("div"); wrap.className="max-w-4xl mx-auto px-5 py-5";
 const label=role==="user"?"Você":"Teacher Marcelo AI";
 const box=role==="user"?"bg-white/5 border border-white/5":"bg-transparent";
 wrap.innerHTML='<div class="text-xs text-gray-500 mb-2">'+label+'</div><div class="'+box+' rounded-2xl px-4 py-3 whitespace-pre-wrap leading-7">'+escapeHtml(text)+'</div>';
 $("messages").appendChild(wrap); $("messages").scrollTop=$("messages").scrollHeight;
 return wrap.querySelector("div:last-child");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

async function loadModel(){
 if(generator)return;
 $("send").disabled=true;
 const webgpu=!!navigator.gpu;
 $("engine").textContent=webgpu?"WebGPU":"WASM";
 setStatus(webgpu?"● baixando modelo para WebGPU…":"● baixando modelo para CPU…");
 try{
   generator=await pipeline("text-generation",MODEL,{
     device:webgpu?"webgpu":"wasm",
     dtype:"q4f16",
     progress_callback:p=>{
       if(p?.status==="progress" && typeof p.progress==="number")
         setStatus("● baixando modelo: "+Math.round(p.progress)+"%");
       else if(p?.status==="initiate") setStatus("● preparando arquivos…");
       else if(p?.status==="done") setStatus("● carregando memória…");
     }
   });
   setStatus("● modelo pronto");
 }catch(e){
   console.error(e); generator=null;
   setStatus("● falha ao carregar — veja o console");
   throw e;
 }finally{$("send").disabled=false}
}

async function answer(userText){
 try{await loadModel()}catch(e){
   addMessage("assistant","Não consegui carregar o modelo. Se o progresso ficou parado, atualize a página e verifique se o navegador permite WebGPU. O console (F12 → Console) mostrará o erro.");
   return;
 }
 messages.push({role:"user",content:userText});
 const promptMessages=[{role:"system",content:systemBase+" "+modePrompts[mode]},...messages.slice(-8)];
 setStatus("● pensando…"); $("send").disabled=true;
 try{
   let live="";
   const streamer=new TextStreamer(generator.tokenizer,{skip_prompt:true,skip_special_tokens:true,callback_function:t=>{
     live+=t; setStatus("● gerando…");
   }});
   const out=await generator(promptMessages,{max_new_tokens:384,do_sample:true,temperature:0.7,top_p:0.9,streamer});
   const generated=out?.[0]?.generated_text;
   const text=Array.isArray(generated)?generated.at(-1)?.content:(live||"Não consegui gerar uma resposta.");
   messages.push({role:"assistant",content:text}); addMessage("assistant",text);
 }catch(e){console.error(e);addMessage("assistant","Erro durante a geração. Tente novamente.");}
 finally{setStatus("● pronto");$("send").disabled=false}
}

$("form").addEventListener("submit",async e=>{
 e.preventDefault();const input=$("input");const text=input.value.trim();if(!text)return;
 addMessage("user",text);input.value="";input.style.height="auto";await answer(text);
});
$("input").addEventListener("input",e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,160)+"px"});
$("newChat").addEventListener("click",()=>{messages=[];$("messages").innerHTML='<div id="welcome" class="max-w-3xl mx-auto px-5 py-16 text-center"><div class="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 grid place-items-center text-2xl">✦</div><h2 class="text-3xl font-bold mb-3">Nova conversa</h2><p class="text-gray-400">Digite sua primeira mensagem.</p></div>';});
document.querySelectorAll(".mode").forEach(btn=>btn.addEventListener("click",()=>{mode=btn.dataset.mode;$("modeTitle").textContent=mode;document.querySelectorAll(".mode").forEach(b=>b.classList.remove("bg-orange-500/15","text-orange-300"));btn.classList.add("bg-orange-500/15","text-orange-300")}));
document.querySelectorAll(".prompt").forEach(btn=>btn.addEventListener("click",()=>{$("input").value=btn.textContent;$("form").requestSubmit()}));
setStatus("● pronto para carregar");
