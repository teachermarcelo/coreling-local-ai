# Coreling Local AI — Teacher Marcelo

Configuração pronta para Windows para instalar e iniciar o Coreling localmente.

Este repositório fornece scripts de configuração; ele não redistribui o software Coreling.

## Instalação rápida — Windows

Abra o PowerShell na pasta do projeto e execute:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup-coreling.ps1
.\start-coreling.ps1
```

O instalador oficial do Coreling será usado. Na primeira execução, o Coreling baixa os componentes necessários localmente.

## Personalização

O `brain-template.md` prepara uma memória inicial voltada para ensino de inglês, CEFR, lesson plans, criação de conteúdo, roteiros e desenvolvimento de sistemas educacionais.

O setup faz backup de um `%USERPROFILE%\.coreling\brain.md` existente antes de instalar o template.

## Requisitos

Windows 10/11, Python 3.7+, Node.js 22+ e 8 GB+ de RAM recomendados.

## Documentação oficial

https://www.coreling.org/docs

Nunca coloque senhas, tokens ou API keys neste repositório.
