const QUOTES = [
  "Não entre em pânico.",
  "O espaço é grande. Realmente grande. Você não vai acreditar no quão vastamente, enormemente, inacreditavelmente grande ele é.",
  "A resposta para a vida, o universo e tudo mais é 42.",
  "Tempo é uma ilusão. Hora do almoço, duplamente.",
  "Não é que eu tenha medo de morrer, só que não quero estar lá quando acontecer.",
  "A Terra é o planeta mais idiota da Galáxia — mas pelo menos tem chá.",
  "Qualquer coisa que aconteça, acontece. Qualquer coisa que ao acontecer cause outra coisa a acontecer, causa outra coisa a acontecer. Qualquer coisa que ao acontecer cause a si mesma a acontecer novamente, acontece novamente.",
  "A única coisa pior do que ser falado é não ser falado.",
  "Se você souber onde sua toalha está, você está no controle.",
  "O problema com os seres inteligentes é que eles ficam inteligentes o suficiente para se comportar de maneira completamente idiota.",
  "Um erro comum que as pessoas cometem ao tentar projetar algo completamente à prova de falhas é subestimar a engenhosidade dos completos tolos.",
  "Engraçado, disse ele em tom fúnebre, como justamente quando você pensa que a vida não pode piorar, de repente piora.",
  "As chances de descobrir o que realmente está acontecendo no universo são tão remotas que a única coisa a fazer é ignorar o assunto e se manter ocupado.",
  "É um erro pensar que se pode resolver qualquer problema importante apenas com batatas.",
  "Nada viaja mais rápido que a velocidade da luz, com a possível exceção das más notícias.",
  "Tudo o que você realmente precisa saber por enquanto é que o universo é muito mais complicado do que você imagina, mesmo partindo do princípio de que ele já é bastante complicado.",

  "Formulários de login foram inventados pelos Vogons. Assim como tudo que os Vogons criaram, seu único propósito é causar sofrimento desnecessário.",
  "O Guia classifica erros de validação como 'irritantes, porém esperados'. Recomenda-se uma xícara de chá quente e uma segunda tentativa.",
  "Pesquisas recentes do Instituto Galáctico de Estudos Desnecessários concluíram que 94% dos erros de formulário poderiam ser evitados se os usuários simplesmente não tentassem.",
  "Segundo o Guia, senhas são a segunda invenção mais inútil do universo. A primeira é o formulário de reclamação Vogon em triplicata.",
  "O universo tem 13,8 bilhões de anos. Você tem todo o tempo para tentar de novo. Use-o.",
  "Marvin, o Robô Paranóico, tentou preencher este formulário uma vez. 'Cérebro do tamanho de um planeta', disse ele, 'e ainda erro o email.' Ele nunca se recuperou.",
  "Betelgeuse explodiu há 640 anos-luz. A luz ainda não chegou aqui. Seus dados de formulário chegaram, mas com erro.",
  "Sabe o que há de fascinante nos erros? Eles são completamente inevitáveis, totalmente esperados, e ainda assim surpreendem a todos. Assim como os Vogons na poesia.",
  "Em algum lugar do universo, uma versão sua preencheu este formulário corretamente. Infelizmente, você não é essa versão.",
  "O computador Deep Thought levou 7,5 milhões de anos para calcular a Resposta. Você certamente pode reservar mais 30 segundos para corrigir seu email.",
  "Curiosidade: em Damogran, planeta natal do Presidente Zaphod Beeblebrox, erros de senha são punidos com uma leitura de poesia Vogon. Considere-se com sorte.",
  "De acordo com o Guia do Mochileiro das Galáxias, a probabilidade de um formulário ser preenchido corretamente na primeira tentativa é de 1 em 2 elevado ao número de campos, e você tem muitos campos.",
  "O Drive de Improbabilidade Infinita calculou que este erro específico era, na verdade, o resultado mais provável de todos os resultados possíveis. Parabéns.",

  // Frases específicas sobre toalha + abdução
  "O Guia do Mochileiro das Galáxias dedica 17 páginas à toalha. Apenas 2 à abdução bovina. A proporção não é acidente.",
  "Um ET sem toalha tentando abduzir uma vaca de nível SAGRADA é, segundo o Guia, 'o ato mais otimista e mal calculado do universo conhecido'.",
  "A toalha serve para se enrolar quando está com frio, deitar quando está com calor, usar como vela improvisada numa emergência hiperespacial, e — criticamente — para mostrar que você sabe o que está fazendo. Você claramente não sabe.",
  "Capítulo 42 do Guia: 'Vacas de proteção DIVINA não são abduzidas por ETs sem toalha. Isso não é preconceito. É física.'",
  "Zaphod Beeblebrox tentou abduzir uma vaca SAGRADA sem toalha uma vez. O resultado foi classificado como 'inacreditavelmente imprudente, mesmo para ele'.",
];

export function randomQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
