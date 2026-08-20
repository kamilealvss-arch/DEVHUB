const DB_URL = "https://htlyccadeagvimfphadt.supabase.co";
const DB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bHljY2FkZWFndmltZnBoYWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzM4ODQsImV4cCI6MjA5NTY0OTg4NH0.DyvzRvWBkKCzPwz8H45_SOlyGK1nAIWu6t31VVnDU7E"; // Use a mesma chave pública do seu projeto


const supabaseClient = supabase.createClient(DB_URL, DB_KEY);

document.getElementById('form-nova-senha').addEventListener('submit', async (e) => {
    e.preventDefault();

    const novaSenha = document.getElementById('nova-senha').value;

    try {
      
        const { data, error } = await supabaseClient.auth.updateUser({
            password: novaSenha
        });

        if (error) throw error;

        alert("Senha atualizada com sucesso! Você será redirecionado para a página de login.");
        
        window.location.href = "login.html"; 

    } catch (err) {
        console.error("Erro ao atualizar senha:", err.message);
        alert("Não foi possível atualizar a senha: " + err.message);
    }
});