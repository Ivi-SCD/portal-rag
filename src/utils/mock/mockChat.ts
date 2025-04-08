import { Filter } from "#/stores/filtersStore";
import { Message } from "#/stores/messagesStore";

export const message: Message = {
  uuid: "uuid-teste-sem-doc",
  text: "Oiii bot",
  type: "user"
};

export const messageWithDoc: Message = {
  uuid: "uuid-teste",
  text: "Sobre o que fala esse documento?",
  type: "user",
  file: new File(["teste teste"], "teste.txt", {
    type: "application/pdf"
  })
};

export const botMessageWithDoc: Message = {
  uuid: "uuid-teste",
  text: "O documento 'teste.txt' tem o texto 'teste teste'.",
  type: "bot",
  fileList: [
    {
      nome_documento: "teste",
      extensao: "application/pdf",
      conteudo_base64: "dGVzdGUNCnRlc3RlDQo=",
      id_dominio: "dominio-publico-teste"
    }
  ]
};

export const botResponse = {
  documentos: [],
  response: "Olá! Como posso te ajudar hoje?"
};

export const botResponseWithDoc = {
  documentos: [
    {
      base64: "temporario",
      dominio: "temporario",
      extensao: "text/plain",
      nome_documento: "teste.txt"
    }
  ],
  response: "O documento 'teste.txt' tem o texto 'teste teste'."
};

export const botMessage: Message = {
  uuid: "uuid-teste-sem-doc",
  text: "Como posso te ajudar?",
  type: "bot"
};

export const errorBotMessage: Message = {
  uuid: "uuid-teste",
  text: "Desculpe, não consegui responder sua pergunta. Por favor, tente novamente mais tarde!",
  type: "bot",
  fileList: undefined
};

export const mockedFilters: Filter[] = [
  {
    type: "public",
    name: "dominio-publico-teste",
    selected: true
  },
  {
    type: "private",
    name: "dominio-privado-teste",
    selected: false
  }
];

export const mockedNotSelectFilters: Filter[] = [
  {
    type: "public",
    name: "dominio-publico-teste",
    selected: false
  },
  {
    type: "private",
    name: "dominio-privado-teste",
    selected: false
  }
];

// {
//   "session_token": "22bcf7ed-c6a2-4ac1-9809-9ab410fcc120",
//   "query": "Sobre o que fala esse documento?",
//   "dominios": [
//       "Teste Figma"
//   ],
//   "documento": "teste.txt",
//   "base64": "dGVzdGUNCnRlc3RlDQo=",
//   "extensao": "text/plain"
// }

// {
//   "documentos": [
//       {
//           "base64": "temporario",
//           "dominio": "temporario",
//           "extensao": "text/plain",
//           "nome_documento": "teste.txt"
//       }
//   ],
//   "response": "O documento 'teste.txt' tem o texto 'teste teste'."
// }

// {
// session_token: "22bcf7ed-c6a2-4ac1-9809-9ab410fcc120",
//   query: "olá",
//   dominios: ["Teste Figma"],
//   documento: [],
//   base64: false,
//   extensao: false
// }
