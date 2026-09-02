import type { ProfileId } from '../types'

// Banco local de frases — tom: parceiro de treino, sem culpa, sem body-shaming.
const MICHEL: string[] = [
  'Dia de treino é dia de vento a favor. 30 minutos e pronto. 🪁',
  'Cada dead bug de hoje é uma rasgada mais firme no downwind.',
  'A virilha agradece cada alongamento. Constância cura.',
  'Kite semiprofissional começa num goblet squat bem feito.',
  'O mar não espera, mas recompensa quem se preparou.',
  '30 minutos hoje = horas a mais na água na temporada.',
  'Core firme em terra, tranquilidade no chop.',
  'O swing de hoje é o waterstart de amanhã.',
  'Ninguém veleja bem com a lombar reclamando. Bora blindar.',
  'Treino curto, propósito grande: você e o vento.',
  'A prancha de Copenhague é seguro contra dor. Paga em 20 segundos.',
  'Quem alonga o posterior hoje agradece no primeiro salto.',
  'Vento bom favorece quem está pronto. Fica pronto.',
  'Sessão de 30 min: menos que um episódio de série, mais que qualquer desculpa.',
  'Seu corpo é o equipamento mais caro do quiver. Faz a manutenção.',
  'Três treinos por semana viram doze por mês. Isso muda um velejador.',
  'Hoje é dia C: o dia que resolve a virilha. Não pula.',
  'Força de pernas em terra é conforto na prancha na água.',
  'Cada sessão registrada é um degrau. Sobe mais um hoje.',
  'Remo, remada — puxar forte aqui é segurar a barra lá.',
  'O canal de Ilhabela está aí. Treina para merecer o vento.',
  'A meta não é perfeição, é presença. Aparece hoje.',
  'Farmer carry: pegada de ferro para sessões longas de kite.',
  'Um treino de cada vez. Uma velejada de cada vez.',
  'A dor na virilha odeia sua constância. Continua.',
  'Aquecer os adutores leva 2 minutos. Lesão leva 2 meses.',
  'Hoje o treino é curto. O verão de kite vai ser longo.',
  'Corpo preparado transforma medo de manobra em vontade.',
  'A sequência que importa não é a do app — é a sua na água.',
  'Bom vento começa com bom treino. Simples assim.',
]

const GABRIELLA: string[] = [
  'Hoje é dia de ficar forte. 45 minutos, você e os halteres. 💪',
  'Constância vale mais que intensidade. Aparece hoje.',
  'O treino de hoje é o pique de amanhã.',
  'Bloco por bloco, série por série. É assim que se constrói.',
  'Seu único compromisso agora: 45 minutos com você mesma.',
  'Força não aparece de um dia pro outro — aparece de tanto você aparecer.',
  'O step está te esperando. Ele não sobe sozinho.',
  'Duas últimas reps difíceis? É aí que o treino acontece.',
  'Cada treino registrado é uma promessa cumprida com você.',
  'Não precisa estar animada. Precisa só começar o aquecimento.',
  'Músculo é o plano de previdência mais honesto que existe.',
  'Semana boa é semana com treino. Faz a sua.',
  'O sumô de hoje agradece na escada de amanhã.',
  'Você não treina para caber em nada. Treina para transbordar.',
  'Meia hora de "não estou a fim" perde para 5 minutos de treino começado.',
  'Ritmo lento e controlado — a Madi aprovaria.',
  'Progresso é o halter que ficou leve sem você perceber.',
  'Seu treino, suas regras, seu tempo. Só não deixa de ser seu dia.',
  'Corpo forte, cabeça leve. O resto do dia agradece.',
  'A série 3 é onde mora a evolução. Vai até ela.',
  'Um treino nunca é perdido. Nem os 20 minutos que deu pra fazer.',
  'Força de mulher se mede em constância. E a sua está crescendo.',
  'Hoje pode ser leve. Aparecer já é o treino.',
  'O cardio final são só 4 minutos. Você aguenta 4 minutos de qualquer coisa.',
  'Halteres na mão, playlist boa, mundo lá fora esperando.',
  'Ninguém se arrepende do treino que fez.',
  'Cada ponte de glúteo é um degrau a menos que pesa.',
  'Fica forte no seu ritmo. O app só anota, quem faz é você.',
  'Treinar em casa é superpoder: zero deslocamento, 100% resultado.',
  'Sua sequência não quebra por um dia difícil. Ela cresce com os dias feitos.',
]

const BANK: Record<ProfileId, string[]> = { michel: MICHEL, gabriella: GABRIELLA }

/** Frase do dia — determinística por data, sem repetir dentro de 30 dias. */
export function quoteOfTheDay(profileId: ProfileId, dateISO: string): string {
  const bank = BANK[profileId]
  const day = Math.floor(new Date(dateISO + 'T12:00:00').getTime() / 86400000)
  return bank[day % bank.length]
}
