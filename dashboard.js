from flask import Flask, request, jsonify
import datetime
import random

app = Flask(__name__)

# Simulação de dados da salina
salina_data = {
    "evaporacao_historico": [],
    "nivel_agua": 100,  # Em centímetros
    "salinidade": 3.5,  # Em porcentagem
    "bomba_status": False,
    "comportas": "Fechadas"
}

def calcular_previsao_sal():
    """
    Calcula a previsão de sal decantado com base no histórico de evaporação.
    """
    if not salina_data["evaporacao_historico"]:
        return 0
    
    media_evaporacao = sum(salina_data["evaporacao_historico"]) / len(salina_data["evaporacao_historico"])
    previsao_sal = media_evaporacao * 0.25  # Fator de conversão baseado na concentração de sal
    return round(previsao_sal, 2)

@app.route("/status", methods=["GET"])
def get_status():
    """Retorna o status atual da salina."""
    return jsonify({
        "nivel_agua": salina_data["nivel_agua"],
        "salinidade": salina_data["salinidade"],
        "bomba_status": salina_data["bomba_status"],
        "comportas": salina_data["comportas"],
        "previsao_sal": calcular_previsao_sal()
    })

@app.route("/atualizar", methods=["POST"])
def atualizar_dados():
    """Recebe novos dados de sensores e atualiza os valores."""
    dados = request.json
    
    if "nivel_agua" in dados:
        salina_data["nivel_agua"] = dados["nivel_agua"]
    if "salinidade" in dados:
        salina_data["salinidade"] = dados["salinidade"]
    if "evaporacao" in dados:
        salina_data["evaporacao_historico"].append(dados["evaporacao"])
    
    return jsonify({"message": "Dados atualizados com sucesso"})

@app.route("/controle", methods=["POST"])
def controle_remoto():
    """Controla a abertura de comportas e ativação de bombas remotamente."""
    comando = request.json.get("comando")
    
    if comando == "ligar_bomba":
        salina_data["bomba_status"] = True
    elif comando == "desligar_bomba":
        salina_data["bomba_status"] = False
    elif comando == "abrir_comporta":
        salina_data["comportas"] = "Abertas"
    elif comando == "fechar_comporta":
        salina_data["comportas"] = "Fechadas"
    else:
        return jsonify({"message": "Comando inválido"}), 400
    
    return jsonify({"message": "Comando executado"})

if __name__ == "__main__":
    app.run(debug=True)
