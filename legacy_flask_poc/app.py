from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to InfraGuard! Secure DevOps Pipeline.",
        "status": "Running",
        "version": "1.0.0"
    })

@app.route('/health')
def health():
    return jsonify({"status": "healthy"}), 200

# Optional: Keep a crash endpoint for simple log testing, but remove email alerts
@app.route('/crash')
def crash():
    """Intentional crash to test recovery/logging"""
    raise Exception("Intentional System Crash Triggered")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
