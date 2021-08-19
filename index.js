// Inicia as dependencias do robo
const fs = require('fs');
const {Client, MessageMedia} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Caminho onde os dados da sessão serão armazenados
const SESSION_FILE_PATH = './session.json';

// Carrega os dados da sessão se eles foram salvos anteriormente
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Usa a sessão salva
const client = new Client({
    session: sessionData
});

// Salva os valores da sessão no arquivo session.json após a autenticação bem-sucedida
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

// Caso não encontre uma sessão ativa aqui é gerado um QR Code
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

// Exibe a mensagem caso a autenticação seja bem-sucedida
client.on('ready', () => {
    console.log('Cliente Ativo!');
});

client.initialize();

// Inicia conversação
client.on('message', message => {
	if(message.body === 'Oi') {
		client.sendMessage(message.from, 'Oi');
	}
});

// Mencionando todos no grupo
client.on('message', async (msg) => {
    if(msg.body === '!todos') {
        const chat = await msg.getChat();
        
        let text = "";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }
});

client.on('message', async msg => {
    if (msg.body === '!grupo') {
        const chat = await msg.getChat();
        if (chat.isGroup) {
await chat.sendMessage(`*Detalhes do Grupo*
Nome: ${chat.name}
Descrição: ${chat.description}
Criado em: ${chat.createdAt.toString()}
Criado Por: ${chat.owner.user}
Membros: ${chat.participants.length}`);
        }
    }
});