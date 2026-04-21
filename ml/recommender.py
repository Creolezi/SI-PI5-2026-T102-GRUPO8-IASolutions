import json
import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from transformers import AutoTokenizer, AutoModel
import torch

class NLPRecommender:
    def __init__(self):
        # Carregando modelo base BERTimbau
        print("Baixando e alocando modelo BERTimbau (neuralmind/bert-base-portuguese-cased)... Isso pode demorar na primeira vez.")
        self.tokenizer = AutoTokenizer.from_pretrained("neuralmind/bert-base-portuguese-cased")
        self.model = AutoModel.from_pretrained("neuralmind/bert-base-portuguese-cased")
        
        # Carregando a Base de Conhecimento
        dataset_path = os.path.join(os.path.dirname(__file__), '..', 'knowledge_base.json')
        with open(dataset_path, 'r', encoding='utf-8') as f:
            self.dataset = json.load(f)
            
        # Preparando textos de referencia (Problema + Sintomas)
        self.texts = []
        for item in self.dataset:
            text = f"Problema: {item['classe']} Sintomas: {item['perguntas']}"
            self.texts.append(text)
            
        # Gerando Embeddings primários por Mean Pooling (rodando localmente)
        print("Gerando Embeddings da base de conhecimento...")
        self.base_embeddings = self._encode(self.texts)
        
        # Adicionando TF-IDF para busca Híbrida (Sparse + Dense)
        # Ignorando palavras de conexão para o TF-IDF focar estritamente nos problemas técnicos
        stop_words_pt = ['o', 'a', 'os', 'as', 'um', 'uma', 'meu', 'minha', 'está', 'é', 'são', 'que', 'de', 'do', 'da', 'com', 'para', 'na', 'no', 'em', 'tem']
        self.tfidf_vectorizer = TfidfVectorizer(stop_words=stop_words_pt, strip_accents='unicode')
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.texts)
        print("Base processada com sucesso. IA Pronta.")
        
    def _encode(self, texts):
        # Transforma o texto em Tensores limitando a 128 tokens
        inputs = self.tokenizer(texts, padding=True, truncation=True, return_tensors="pt", max_length=128)
        with torch.no_grad():
            outputs = self.model(**inputs)
        # Faz uma média (Mean Pooling) para resumir o significado da frase num vetor numérico
        embeddings = outputs.last_hidden_state.mean(dim=1)
        return embeddings.numpy()

    def recommend(self, user_query: str, top_n=3):
        # Codifica o que o usuario acabou de escrever
        query_emb = self._encode([user_query])
        
        # Similaridade Dense (BERT)
        bert_sim = cosine_similarity(query_emb, self.base_embeddings)[0]
        
        # Similaridade Sparse (TF-IDF) para garantir precisão cirúrgica no contexto
        query_tfidf = self.tfidf_vectorizer.transform([user_query])
        tfidf_sim = cosine_similarity(query_tfidf, self.tfidf_matrix)[0]
        
        # Score Híbrido: Mesclando 50/50. 
        # O BERT cuida da semântica invisível, e o TF-IDF pontua as palavras-chave críticas.
        similarities = (bert_sim * 0.5) + (tfidf_sim * 0.5)
        
        # Pegar os TOP índices de maior similaridade
        top_indices = np.argsort(similarities)[::-1][:top_n]
        
        max_raw_score = float(similarities[top_indices[0]])
        
        # Limiar de Tolerância reajustado para 35% por conta da fusão com BERT
        if max_raw_score < 0.35:
            return {
                "chatbot_mode": True, 
                "reply": "Olá! Eu sou a Inteligência Artificial de Suporte Técnico do Grupo 8. Atualmente, fui treinada para resolver problemas e diagnosticar falhas de Câmeras, DVR, Rede e Controle de Acesso... Como posso lhe ajudar hoje?"
            }
            
        # Converter as distâncias cruas do Cosseno em Distribuição de Probabilidades que somam exatos 100%
        # Usamos uma técnica clássica da matemática de Machine Learning: Softmax com Temperatura
        top_scores = np.array([float(similarities[i]) for i in top_indices])
        scaled_scores = top_scores * 8  # Aumenta a temperatura para a IA garantir maior certeza no #1
        exps = np.exp(scaled_scores - np.max(scaled_scores))
        probs = exps / np.sum(exps)

        results = []
        for i, idx in enumerate(top_indices):
            final_prob = float(probs[i])
            results.append({
                "probabilidade": round(final_prob * 100, 2),
                "classe": self.dataset[idx]['classe'],
                "solucoes": self.dataset[idx]['solucoes'],
                "tecnico": self.dataset[idx]['tecnico']
            })
        return {"chatbot_mode": False, "diagnosticos": results}

# Bloco para testes isolados
if __name__ == "__main__":
    rec = NLPRecommender()
    print(rec.recommend("A luz caiu há uns minutos e agora as cameras apagaram todas, to tentando ver nada acontece"))
