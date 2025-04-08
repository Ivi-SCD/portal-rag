export type Document = {
  caminho: string;
  created_at: string;
  created_by: string;
  id_dominio: string;
  nome_documento: string;
  tamanho: string;
  media: string;
};

export type DocumentToSend = {
  nome_documento: string;
  base64: string;
  extensao: string;
};
