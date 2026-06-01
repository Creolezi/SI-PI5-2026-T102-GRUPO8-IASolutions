const form = document.getElementById('chatForm');
const input = document.getElementById('userInput');
const chatHistory = document.getElementById('chatHistory');
const btn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearChatBtn');

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
        contentDiv.innerHTML = `<p>Não encontrei soluções na base atual.</p>`;
        return;
    }

    const topMatch = results[0];

    let html = `
        <div class="diagnostic-main">
            <div class="main-header">
                <span>DIAGNÓSTICO PRINCIPAL</span>
                <strong>${topMatch.probabilidade}%</strong>
            </div>

            <h3>${topMatch.classe}</h3>

            <div class="diag-box">
                <strong>SOLUÇÃO RECOMENDADA</strong>
                <p>${topMatch.solucoes}</p>
            </div>

            <div class="diag-box">
                <strong>AÇÃO TÉCNICA</strong>
                <p>${topMatch.tecnico}</p>
            </div>
        </div>
    `;

    if (results.length > 1) {
        html += `<div class="others-title">Outras possibilidades identificadas</div>`;

        for (let i = 1; i < results.length; i++) {
            const res = results[i];

            html += `
                <div class="diagnostic-alt">
                    <div class="alt-header">
                        <span>${res.classe}</span>
                        <strong>${res.probabilidade}%</strong>
                    </div>

                    <div class="alt-content">
                        <p><strong>Solução:</strong> ${res.solucoes}</p>
                        <p><strong>Ação Técnica:</strong> ${res.tecnico}</p>
                    </div>
                </div>
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

    const aiContent = addMessage(`
        <div class="loading"></div>
        Analisando solicitação...
    `);

    btn.disabled = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 500));

        aiContent.innerHTML = `
            <div class="loading"></div>
            Processando modelo de IA...
        `;

        const response = await fetch(`/api/chat?message=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.error) {
            aiContent.innerHTML = `
                <div class="error-msg">
                    Erro da API: ${data.error}
                </div>
            `;
        } else if (data.chatbot_mode) {
            aiContent.innerHTML = `<p>${data.reply}</p>`;
        } else {
            renderResults(aiContent, data.diagnosticos);
        }

    } catch (err) {
        aiContent.innerHTML = `
            <div class="error-msg">
                Erro de conexão com o servidor FastAPI. Verifique se o uvicorn está rodando.
            </div>
        `;
    } finally {
        btn.disabled = false;
        input.focus();
    }
});

clearBtn.addEventListener('click', () => {
    chatHistory.innerHTML = `
        <div class="message system-msg">
            <div class="avatar">IA</div>
            <div class="content">
                <p>Olá! Eu sou a Inteligência Artificial de Suporte Técnico do Grupo 8. Atualmente, fui treinada para resolver problemas e diagnosticar falhas de Câmeras, DVR, Rede e Controle de Acesso. Como posso lhe ajudar hoje?</p>
            </div>
        </div>
    `;

    input.focus();
});