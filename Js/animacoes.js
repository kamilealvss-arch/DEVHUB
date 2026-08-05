document.addEventListener('DOMContentLoaded', () => {
    // 1. Efeito de Sombra e Fundo no Cabeçalho ao rolar a página
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // 2. Rolagem suave (Smooth Scroll) para os links de navegação
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. Animações de surgimento (Fade-in e Slide-up) ao rolar a página
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // O elemento aparece quando 15% dele entra na tela
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
                // Para de observar depois que a animação acontece (ocorre só uma vez)
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Seleciona os elementos que vão ganhar a animação
    const elementosAnimados = document.querySelectorAll(`
        .cartao-passo, 
        .cartao-recurso, 
        .cartao-preco, 
        .cabecalho-secao,
        .lado-texto-principal,
        .lado-painel-principal
    `);

    // Adiciona a classe inicial oculta e começa a observar
    elementosAnimados.forEach((el, index) => {
        el.classList.add('oculto-animacao');
        
        // Adiciona um pequeno atraso (delay) em cascata para elementos próximos
        el.style.transitionDelay = `${(index % 3) * 0.15}s`;
        
        fadeObserver.observe(el);
    });
});

// --- NOVAS ANIMAÇÕES PARA O HEADER ---

    // 4. Header Inteligente (Esconde ao descer, mostra ao subir)
    let ultimoScroll = 0;
    
    window.addEventListener('scroll', () => {
        let scrollAtual = window.pageYOffset || document.documentElement.scrollTop;
        
        // Se rolou para baixo e passou de 100px da tela, esconde o header
        if (scrollAtual > ultimoScroll && scrollAtual > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            // Se rolou para cima, mostra o header
            header.style.transform = 'translateY(0)';
        }
        ultimoScroll = scrollAtual <= 0 ? 0 : scrollAtual;
    });

    // 5. Scroll Spy (Destaca o menu ativo)
    const secoes = document.querySelectorAll('section, div[id]');
    const linksMenu = document.querySelectorAll('nav a');

    window.addEventListener('scroll', () => {
        let scrollPosicao = window.scrollY + 200; // Offset para ativar um pouco antes

        secoes.forEach(secao => {
            // Verifica se a seção tem um ID
            if (secao.getAttribute('id')) {
                const topoSecao = secao.offsetTop;
                const alturaSecao = secao.offsetHeight;
                const idSecao = secao.getAttribute('id');

                if (scrollPosicao >= topoSecao && scrollPosicao < topoSecao + alturaSecao) {
                    linksMenu.forEach(link => {
                        link.classList.remove('link-ativo');
                        if (link.getAttribute('href') === `#${idSecao}`) {
                            link.classList.add('link-ativo');
                        }
                    });
                }
            }
        });
    });

    // --- 6. EFEITO TILT (INCLINAÇÃO 3D) NOS CARTÕES DE PREÇO ---
    
    const cartoesPreco = document.querySelectorAll('.cartao-preco');

    cartoesPreco.forEach(cartao => {
        cartao.addEventListener('mousemove', (e) => {
            // Pega as dimensões e a posição do cartão
            const rect = cartao.getBoundingClientRect();
            
            // Calcula a posição do mouse em relação ao cartão
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            
            // Encontra o centro do cartão
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Define a intensidade da inclinação (mude o 10 para mais ou menos inclinação)
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;
            
            // Aplica a transformação com um leve ganho de escala (zoom)
            cartao.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        // Quando o mouse sai do cartão, ele volta suavemente para a posição original
        cartao.addEventListener('mouseleave', () => {
            cartao.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });