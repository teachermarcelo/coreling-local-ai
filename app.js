import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

const MODEL = "onnx-community/Qwen2.5-0.5B-Instruct";
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
function addMessage(role, text){
 const welcome=$("welcome"); if(welcome) welcome.remove();
 const wrap=document.createElement("div");
 wrap.className="max-w-4xl mx-auto px-5 py-5";
 const label=role==="user"?"Você":"Teacher Marcelo AI";
 const box=role==="user"?"bg-white/5 border border-white/5":"bg-transparent";
 wrap.innerHTML='<div class="text-xs text-gray-500 mb-2">'+label+'</div><div class="'+box+' rounded-2xl px-4 py-3 whitespace-pre-wrap leading-7">'+escapeHtml(text)+'</div>';
 $("messages").appendChild(wrap); $("messages").scrollTop=$("messages").scrollHeight;
 return wrap.querySelector("div:last-child");
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

async function loadModel(){
 if(generator) return;
 setStatus("● carregando modelo…");
 $("send").disabled=true;
 try{
   const webgpu=!!navigator.gpu;
   $("engine").textContent=webgpu?"WebGPU":"WASM";
   generator=await pipeline("text-generation", MODEL, webgpu
      ? {device:"webgpu",dtype:"q4"}
      : {dtype:"q4"});
   setStatus("● pronto");
 }catch(e){
   console.error(e); setStatus("● erro ao carregar");
   throw e;
 }finally{$("send").disabled=false}
}

async function answer(userText){
 await loadModel();
 messages.push({role:"user",content:userText});
 const promptMessages=[
   {role:"system",content:systemBase+" "+modePrompts[mode]},
   ...messages.slice(-8)
 ];
 setStatus("● pensando…"); $("send").disabled=true;
 try{
   const out=await generator(promptMessages,{max_new_tokens:384,temperature:0.7,do_sample:true,top_p:0.9});
   const generated=out?.[0]?.generated_text;
   let text=Array.isArray(generated)?generated.at(-1)?.content:"";
   if(!text) text="Não consegui gerar uma resposta. Tente novamente.";
   messages.push({role:"assistant",content:text});
   addMessage("assistant",text);
 }catch(e){
   console.error(e); addMessage("assistant","Ocorreu um erro ao gerar a resposta. Verifique se o navegador suporta WebGPU e tente novamente.");
 }finally{setStatus("● pronto");$("send").disabled=false}
}

$("form").addEventListener("submit",async e=>{
 e.preventDefault(); const input=$("input"); const text=input.value.trim(); if(!text)return;
 addMessage("user",text); input.value=""; input.style.height="auto";
 await answer(text);
});
$("input").addEventListener("input",e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,160)+"px"});
$("newChat").addEventListener("click",()=>{messages=[];$("messages").innerHTML='<div id="welcome" class="max-w-3xl mx-auto px-5 py-16 text-center"><div class="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 grid place-items-center text-2xl">✦</div><h2 class="text-3xl font-bold mb-3">Nova conversa</h2><p class="text-gray-400">Digite sua primeira mensagem.</p></div>'});
document.querySelectorAll(".mode").forEach(btn=>btn.addEventListener("click",()=>{mode=btn.dataset.mode;$("modeTitle").textContent=mode;document.querySelectorAll(".mode").forEach(b=>b.classList.remove("bg-orange-500/15","text-orange-300"));btn.classList.add("bg-orange-500/15","text-orange-300")}));
document.querySelectorAll(".prompt").forEach(btn=>btn.addEventListener("click",()=>{$("input").value=btn.textContent;$("form").requestSubmit()}));
setStatus("● pronto para carregar");
