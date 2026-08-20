const DB_URL = "https://htlyccadeagvimfphadt.supabase.co";
const DB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bHljY2FkZWFndmltZnBoYWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzM4ODQsImV4cCI6MjA5NTY0OTg4NH0.DyvzRvWBkKCzPwz8H45_SOlyGK1nAIWu6t31VVnDU7E";

const supabaseClient = supabase.createClient(DB_URL, DB_KEY);

document.getElementById('form-login-dev').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('dev-email').value.trim();
    const senha = document.getElementById('dev-senha').value;

    try {
    
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha,
        });

        if (error) throw error;

        localStorage.setItem("devLogado", JSON.stringify(data.user));
        
        alert("Autenticação realizada com sucesso!");
        window.location.href = "criar.html"; 

    } catch (err) {
        console.error("Erro no login do desenvolvedor:", err.message);
        alert("Acesso negado: E-mail ou senha incorretos.");
    }
});

