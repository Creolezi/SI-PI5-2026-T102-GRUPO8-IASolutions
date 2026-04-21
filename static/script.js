const form = document.getElementById('chatForm');
const input = document.getElementById('userInput');
const chatHistory = document.getElementById('chatHistory');
const btn = document.getElementById('sendBtn');

function addMessage(text, isUser = false) {
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user-msg' : 'system-msg'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = isUser ? 'U' : 'IA';
    
    const content = document.createElement('div');
    content.className = 'content';
    content.innerHTML = isUser ? `<p>${text}</p>` : text;
    
    if (isUser) {
        div.appendChild(content);
        div.appendChild(avatar);
    } else {
        div.appendChild(avatar);
        div.appendChild(content);
    }

    chatHistory.appendChild(div);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return content;
}

function renderResults(contentDiv, results) {
    if (!results || results.length === 0) {
       contentDiv.innerHTML = "<p>Não encontrei soluções no manual para este problema.</p>";
       return;
    }
    
    // Pega o diagnóstico principal absoluto
    const topMatch = results[0];
    
    let html = `
        <p>Entendi! Analisando seu relato, o diagnóstico principal é <strong style="color: #4fc1ff;">${topMatch.classe}</strong> <em>(Confiança matemática: ${topMatch.probabilidade}%)</em>.</p>
        <div class="result-card" style="border-color: #007acc; background-color: #252526; margin-top: 15px; padding: 15px;">
            <div class="result-solution" style="font-size: 14px; color: #e5e5e5; margin-bottom: 15px;">
                <strong style="color: #4fc1ff;">🟢 O que você deve tentar:</strong><br><br>${topMatch.solucoes}
            </div>
            <div class="result-tech" style="font-size: 13px;">
                <strong style="color: #c586c0;">🛠️ Ação Técnica Interna (Caso não resolva):</strong><br><br>${topMatch.tecnico}
            </div>
        </div>
    `;
    
    // Lista as outras matematicamente possíveis de forma ocultável (expansível - accordions nativos)
    if (results.length > 1) {
        html += `<p style="margin-top: 20px; font-size: 12px; color: #858585;">O algoritmo também filtrou outras ${results.length - 1} possibilidades (clique para expandir):</p>`;
        for(let i = 1; i < results.length; i++) {
            let res = results[i];
            html += `
                <details class="result-card" style="padding: 10px; margin-top: 6px; border-color: #333; cursor: pointer; transition: all 0.2s;">
                    <summary class="result-header" style="font-size: 12px; margin-bottom: 0; outline: none;">
                        <span style="display:inline-block; margin-left: 2px;">#${i + 1} ${res.classe}</span>
                        <span class="result-prob" style="font-size: 11px; float: right;">${res.probabilidade}%</span>
                    </summary>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #3c3c3c; font-size: 13px; cursor: default;">
                        <div style="color: #e5e5e5; margin-bottom: 10px;">
                            <strong style="color: #4fc1ff;">🟢 Tentar:</strong><br>${res.solucoes}
                        </div>
                        <div style="color: #c586c0;">
                            <strong>🛠️ Ação Técnica:</strong><br>${res.tecnico}
                        </div>
                    </div>
                </details>
            `;
        }
    }
    
    contentDiv.innerHTML = html;
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    addMessage(query, true);
    input.value = '';
    
    const aiContent = addMessage('<div class="loading"></div> Processando linguagem natural...');
    btn.disabled = true;

    // Atraso artificial para transmitir a sensação humana/IA trabalhando...
    await new Promise(r => setTimeout(r, 800));
    aiContent.innerHTML = '<div class="loading"></div> Extraindo tensores do modelo...';
    await new Promise(r => setTimeout(r, 800));
    aiContent.innerHTML = '<div class="loading"></div> Calculando similaridade de cosseno...';
    await new Promise(r => setTimeout(r, 800));

    try {
        const response = await fetch(`/api/chat?message=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.error) {
            aiContent.innerHTML = `<p style="color: #f48771;">Erro da API: ${data.error}</p>`;
        } else if (data.chatbot_mode) {
            aiContent.innerHTML = `<p style="color: #9cdcfe;">${data.reply}</p>`;
        } else {
            renderResults(aiContent, data.diagnosticos);
        }
    } catch (err) {
        aiContent.innerHTML = `<p style="color: #f48771;">Erro de conexão com o servidor FastAPI. Verifique se o uvicorn está rodando.</p>`;
    } finally {
        btn.disabled = false;
        input.focus();
    }
});
