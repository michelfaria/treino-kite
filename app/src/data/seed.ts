import type { Exercise, Profile, Section, WorkoutTemplate } from '../types'

const T0 = '2026-09-01T00:00:00.000Z'

let seq = 0
function ex(
  name: string,
  dose: string,
  opts: Partial<Pick<Exercise, 'note' | 'kite' | 'videoId' | 'videoBy' | 'metricType' | 'tracksLoad'>> = {},
): Exercise {
  seq += 1
  return {
    id: `ex-${seq}`,
    name,
    dose,
    note: opts.note,
    kite: opts.kite,
    videoId: opts.videoId,
    videoBy: opts.videoBy,
    metricType: opts.metricType ?? 'reps',
    tracksLoad: opts.tracksLoad ?? false,
  }
}

const tpl = (
  id: string,
  profileId: 'michel' | 'gabriella',
  title: string,
  subtitle: string,
  durationMin: number,
  sections: Section[],
): WorkoutTemplate => ({ id, profileId, title, subtitle, durationMin, sections, createdAt: T0, updatedAt: T0 })

export function seedProfiles(): Profile[] {
  return [
    {
      id: 'michel',
      name: 'Michel',
      theme: 'ocean',
      weeklyGoal: 3,
      reminders: [{ id: 'rem-m1', daysOfWeek: [1, 3, 5], time: '07:00', enabled: true }],
      aiOptIn: false,
      createdAt: T0,
      updatedAt: T0,
    },
    {
      id: 'gabriella',
      name: 'Gabriella',
      theme: 'rose',
      weeklyGoal: 3,
      reminders: [{ id: 'rem-g1', daysOfWeek: [2, 4, 6], time: '08:00', enabled: true }],
      aiOptIn: false,
      createdAt: T0,
      updatedAt: T0,
    },
  ]
}

export function seedTemplates(): WorkoutTemplate[] {
  seq = 0
  return [
    // ————— MICHEL · KITE PREP —————
    tpl('kite-a', 'michel', 'Dia A', 'Base de força + Core estável', 30, [
      {
        title: 'Aquecimento',
        note: '~5 min',
        exercises: [
          ex('Bike ou esteira leve', '2 min', { note: 'Ritmo confortável, só para elevar a temperatura.', metricType: 'time' }),
          ex('Gato-camelo', '8 repetições lentas', { note: 'Em 4 apoios, arredonde e estenda a coluna. Acorda a lombar sem carga.', videoId: 'zwSYR-Kifkg', videoBy: 'Bruna Nunes · Treinamento Funcional' }),
          ex('Ponte de glúteo (sem peso)', '12 repetições', { note: 'Ativa glúteo antes do treino — glúteo forte protege lombar e virilha.', videoId: 'le8ZN02BQCE', videoBy: 'Hora do Treino' }),
          ex('Maior alongamento do mundo', '4 por lado', { note: 'Afundo profundo + rotação de tronco. Abre quadril e virilha em movimento.', videoId: 'LGD7-2gMUTs', videoBy: 'Fabiano Antunes' }),
        ],
      },
      {
        title: 'Circuito principal — 3 voltas',
        note: '~18 min · descanse 60–90s entre voltas',
        exercises: [
          ex('Agachamento taça (goblet squat)', '10–12 reps · halter ou kettlebell no peito', { note: 'Desça até onde conseguir manter o calcanhar no chão e as costas neutras.', kite: 'Base das pernas para absorver o chop e aguentar a prancha na água.', videoId: 'Nx3czyxDjVY', videoBy: 'Pedro Almeida · Mentor Fitness', tracksLoad: true }),
          ex('Remada curvada com halteres', '10–12 reps', { note: 'Tronco inclinado ~45°, costas retas. Puxe o cotovelo em direção ao bolso.', kite: 'Fortalece a "cadeia de puxar" — igual quando o kite te puxa.', videoId: 'aEk2KG_DmOk', videoBy: 'Treino Mestre', tracksLoad: true }),
          ex('Dead bug', '8 por lado, bem lento', { note: 'Deitado, lombar colada no chão o tempo todo. Estenda braço e perna opostos.', kite: 'Core anti-extensão: impede a lombar de "abrir" quando o trapézio puxa.', videoId: '0loS0bRNqfs', videoBy: 'Sarah Castro' }),
          ex('Prancha frontal', '20–40s com boa forma', { note: 'Glúteo e abdômen contraídos, corpo em linha reta. Se tremer a lombar, apoie os joelhos.', kite: 'Rigidez de tronco = transmitir força do kite à prancha sem se machucar.', videoId: 'OnVIGDpnMow', videoBy: 'FISIculturismo.com.br', metricType: 'time' }),
          ex('Elevação pélvica com peso (hip thrust)', '12–15 reps · anilha ou halter no quadril', { note: 'Suba até o quadril estender totalmente, aperte o glúteo 1s no topo.', kite: 'Glúteos fortes tiram carga da lombar e dos adutores — ataca a causa da dor na virilha.', videoId: 'nwkXOSKGnQQ', videoBy: 'Smart Fit', tracksLoad: true }),
        ],
      },
      {
        title: 'Alongamento final',
        note: '~5 min · segure 30–45s cada',
        exercises: [
          ex('Posterior de coxa com faixa/toalha', '40s por perna', { note: 'Deitado, perna esticada para cima, puxe com a faixa até sentir alongar (sem dor).', videoId: 'KLRh02x1br8', videoBy: 'Fisic Academia', metricType: 'time' }),
          ex('Borboleta (adutores)', '45s', { note: 'Sentado, solas dos pés unidas, deixe os joelhos caírem com a gravidade.', videoId: 'VFd1fO_H7do', videoBy: 'Matheus Personal Nutri', metricType: 'time' }),
          ex('Flexor de quadril ajoelhado', '30s por lado', { note: 'Afundo com joelho no chão, aperte o glúteo e leve o quadril à frente.', videoId: 'efCi4JAMBkU', videoBy: 'Cloud Gym', metricType: 'time' }),
        ],
      },
    ]),
    tpl('kite-b', 'michel', 'Dia B', 'Metabólico + Core anti-rotação', 30, [
      {
        title: 'Aquecimento',
        note: '~4 min',
        exercises: [
          ex('Bike moderada', '2 min', { metricType: 'time' }),
          ex('Balanço de perna (frente/trás e lateral)', '10 por perna, cada direção', { note: 'Segure em algo. O balanço lateral aquece exatamente os adutores da virilha.', videoId: 'wF10oYsLUw0', videoBy: 'Hailey Happens Fitness (inglês)' }),
          ex('Agachamento sem peso', '10 reps'),
        ],
      },
      {
        title: 'Circuito principal — 3 voltas',
        note: '~18 min · mínimo entre exercícios, 60s entre voltas',
        exercises: [
          ex('Kettlebell swing', '12–15 reps · comece leve (8–12 kg)', { note: 'Dobradiça de quadril, não agachamento: o KB sobe pelo impulso do quadril. Sem KB: terra romeno leve e rápido com halter.', kite: 'Potência de quadril — o exercício mais "kite" do programa.', videoId: 'MB87gQFA_y0', videoBy: 'Iridium Labs · Tutorial do Hamoy', tracksLoad: true }),
          ex('Pallof press (polia ou elástico)', '10 por lado, segurando 2s', { note: 'De lado para a polia, empurre o cabo à frente do peito e resista à rotação.', kite: 'Anti-rotação pura: o kite puxa de um lado e o tronco fica firme.', videoId: 'Wez6pSiwfJg', videoBy: 'CT Powerfit' }),
          ex('Afundo reverso (passada para trás)', '8 por perna · sem peso ou halteres leves', { note: 'Passo para trás é mais gentil com joelho e virilha. Tronco ereto.', kite: 'Força unilateral — na prancha cada perna trabalha diferente.', videoId: 'p6S75W3TkDA', videoBy: 'Equipe Fun Sports', tracksLoad: true }),
          ex('Puxada alta na polia (pulley)', '10–12 reps', { note: 'Puxe a barra ao peito, peito aberto, sem balançar o tronco.', kite: 'Dorsais e antebraço para bodydrag, waterstart e sessões longas.', videoId: 'BOW9my4J_ek', videoBy: 'Treino Mestre', tracksLoad: true }),
          ex('Prancha lateral', '15–30s por lado', { note: 'Cotovelo sob o ombro, quadril alto. Se preciso, joelhos apoiados.', kite: 'Oblíquos E adutores — proteção direta para a virilha.', videoId: '2NjO5KrlVEM', videoBy: 'Rodrigo Zago Treinador', metricType: 'time' }),
        ],
      },
      {
        title: 'Finalizador metabólico',
        note: '~3 min',
        exercises: [
          ex('Caminhada do fazendeiro (farmer carry)', '2 × 30–40 m · halteres pesados', { note: 'Ande ereto, passos curtos, abdômen firme. Descanse 45s entre as voltas.', kite: 'Pegada de ferro + core sob carga andando.', videoId: 'xb1GMZacM8w', videoBy: 'Bruna Nunes · Treinamento Funcional', tracksLoad: true }),
        ],
      },
      {
        title: 'Alongamento final',
        note: '~4 min',
        exercises: [
          ex('Adutor ajoelhado (rock-back)', '10 idas lentas por lado', { note: 'Em 4 apoios, uma perna esticada para o lado; quadril para trás até alongar a virilha.', videoId: 'FkxBaLFrlSE', videoBy: 'Perform 360 (inglês)' }),
          ex('Piriforme (figura 4 deitado)', '30s por lado', { videoId: 'AYKYKmTsv0w', videoBy: 'Escoliose Brasil · Rodrigo Andrade', metricType: 'time' }),
          ex('Posterior de coxa em pé', '30s por perna', { note: 'Pé no banco baixo, perna quase esticada, incline com as costas retas.', videoId: 'XLqB7-XL65E', videoBy: 'Volpert Gym', metricType: 'time' }),
        ],
      },
    ]),
    tpl('kite-c', 'michel', 'Dia C', 'Posterior, lombar e blindagem da virilha', 30, [
      {
        title: 'Aquecimento',
        note: '~4 min',
        exercises: [
          ex('Bike leve', '2 min', { metricType: 'time' }),
          ex('Agachamento cossaco (parcial)', '5 por lado, até onde for confortável', { note: 'Pernas bem afastadas, desça para um lado de cada vez. Amplitude cresce com as semanas.', videoId: 'hQ-AqY_BEmk', videoBy: 'Emy Oliveira' }),
          ex('90/90 de quadril', '5 trocas lentas por lado', { note: 'Sentado, pernas em "Z"; gire os joelhos de um lado para o outro.', videoId: 'i8Y_v2AWqKc', videoBy: 'Emy Oliveira' }),
        ],
      },
      {
        title: 'Circuito principal — 3 voltas',
        note: '~17 min · descanse 60–90s entre voltas',
        exercises: [
          ex('Stiff romeno com halteres (RDL)', '10 reps · peso leve/moderado', { note: 'Joelhos semiflexionados, quadril para trás, costas SEMPRE neutras. Pare quando o posterior "puxar".', kite: 'Fortalece o posterior alongando — antídoto do encurtamento que trava a virilha.', videoId: 'cETLf4xXYCQ', videoBy: 'Miqueias Alves Personal', tracksLoad: true }),
          ex('Agachamento sumô com halter', '10–12 reps · pés bem afastados', { note: 'Halter pendurado entre as pernas. Joelhos seguem a direção dos pés.', kite: 'Adutores como motores, não só freio — virilha forte reclama menos.', videoId: 'ED9NUglcBrs', videoBy: 'Miqueias Alves Personal', tracksLoad: true }),
          ex('Prancha de Copenhague (curta)', '10–20s por lado · joelho no banco', { note: 'O exercício com mais evidência contra dor na virilha. Comece conservador; se doer, diminua o tempo.', kite: 'Blindagem direta dos adutores: ~40% menos lesões de virilha.', videoId: 'bU8aazv5voo', videoBy: 'Runna (inglês) · versão iniciante', metricType: 'time' }),
          ex('Bird dog', '8 por lado, pausa de 2s', { note: 'Em 4 apoios, estenda braço e perna opostos sem girar o quadril.', kite: 'Estabilidade lombar que se transfere para a prancha.', videoId: 'ZdAHe9_HeEw', videoBy: 'NASM (inglês)' }),
          ex('Extensão lombar no banco romano', '10–12 reps, sem peso', { note: 'Suba só até a linha reta (não hiperestenda). Sem banco: "superman" segurando 3s.', kite: 'Eretores resistentes para horas de trapézio sem dor no dia seguinte.', videoId: '6Bg5woPBEA8', videoBy: 'Dan Champions' }),
        ],
      },
      {
        title: 'Mobilidade final — a parte que resolve a virilha',
        note: '~7 min · não pule!',
        exercises: [
          ex('Posterior de coxa com faixa', '2 × 40s por perna', { note: 'Prioridade nº 1. Tensão firme, nunca dor aguda. Respire e deixe ceder.', videoId: 'KLRh02x1br8', videoBy: 'Fisic Academia', metricType: 'time' }),
          ex('Sapo (frog stretch)', '60s', { note: 'Joelhos bem afastados, quadril para trás. Alongamento profundo de adutores.', videoId: 'X1xuLlDjh24', videoBy: 'Miqueias Alves Personal', metricType: 'time' }),
          ex('Flexor de quadril + alcance', '30s por lado', { note: 'Afundo ajoelhado, braço esticado para cima e levemente para o lado oposto.', videoId: 'efCi4JAMBkU', videoBy: 'Cloud Gym', metricType: 'time' }),
          ex('Torção deitada', '30s por lado', { note: 'Joelho cruzado sobre o corpo, ombros no chão. Relaxa a lombar para fechar.', videoId: 'MBDvGCm2ipo', videoBy: 'Prof. Matheus Gomes', metricType: 'time' }),
        ],
      },
    ]),

    // ————— GABRIELLA · FULL BODY —————
    tpl('gab-1', 'gabriella', 'Treino 1', 'Força total com combos', 45, [
      {
        title: 'Aquecimento',
        note: '~4 min',
        exercises: [
          ex('Polichinelo', '1 min em ritmo leve', { videoId: 'S2uqQ9zHZMc', videoBy: 'Smart Fit', metricType: 'time' }),
          ex('Agachamento sem peso', '15 reps', { note: 'Amplitude completa, ritmo controlado.' }),
          ex('Círculos de braço + balanço de perna', '30s cada', { note: 'Prepara ombros e quadril para os combos.', metricType: 'time' }),
        ],
      },
      {
        title: 'Bloco 1 — 3 séries',
        note: 'descanse 1 min entre as séries',
        exercises: [
          ex('Agachamento com desenvolvimento (thruster)', '12 reps · halteres nos ombros', { note: 'Agacha e, ao subir, empurra os halteres acima da cabeça num movimento só.', videoId: 'K8dBAmZ_S_M', videoBy: 'Prof. Matheus Gomes', tracksLoad: true }),
          ex('Remada alternada em prancha (renegade row)', '10 por lado', { note: 'Em prancha com as mãos nos halteres, reme sem girar o quadril.', videoId: 'rcDXs9JL4xI', videoBy: 'Rafa Leite', tracksLoad: true }),
          ex('Abdominal remador', '20 reps', { note: 'Suba tronco e joelhos ao mesmo tempo, como se remasse.', videoId: 'eTfET_z6Oyw', videoBy: 'Treino Correto' }),
        ],
      },
      {
        title: 'Bloco 2 — 3 séries',
        note: 'descanse 1 min entre as séries',
        exercises: [
          ex('Agachamento sumô com elevação frontal', '12 reps · um halter com as duas mãos', { note: 'Ao subir do sumô, eleve o halter até os ombros com os braços esticados.', videoId: 'brqU_-WbBl0', videoBy: 'Demonstração (inglês)', tracksLoad: true }),
          ex('Supino no chão com halteres', '15 reps', { note: 'Cotovelos tocam o chão de leve e empurra de volta.', videoId: 'k1hzEiVnJ40', videoBy: 'Demonstração em PT', tracksLoad: true }),
          ex('Canivete unilateral', '12 por lado', { note: 'Encoste a mão no pé oposto elevando tronco e perna ao mesmo tempo.', videoId: 'nJ9aAEt_2i0', videoBy: 'Prof. Matheus Gomes' }),
        ],
      },
      {
        title: 'Bloco 3 — 3 séries',
        note: 'descanse 1 min entre as séries',
        exercises: [
          ex('Stiff indo para crucifixo inverso', '12 reps', { note: 'Desce o stiff; embaixo, abre os braços num crucifixo inverso; fecha e sobe.', videoId: 'B7hyc0icbdU', videoBy: 'Demonstração (inglês)', tracksLoad: true }),
          ex('Ponte de glúteo com supino', '16 reps', { note: 'Em ponte com quadril alto e contraído, faça o supino. Dois exercícios em um.', videoId: '5bM4JL4Xlio', videoBy: 'OPEX Fitness (inglês)', tracksLoad: true }),
          ex('Prancha com toque no ombro', '30 segundos', { note: 'Toque um ombro de cada vez sem balançar o quadril.', videoId: 'tlq8yXV5ZV0', videoBy: 'Prof. Matheus Gomes', metricType: 'time' }),
        ],
      },
      {
        title: 'Cardio final — 1x',
        note: '45s cada, 15s de troca · ~4 min',
        exercises: [
          ex('Agachamento com salto', '45s', { videoId: 'gnz5OFSO2IU', videoBy: 'Demonstração em PT', metricType: 'time' }),
          ex('Skipping (corrida alta)', '45s', { videoId: 'MKlVqYZ2q50', videoBy: 'Demonstração em PT', metricType: 'time' }),
          ex('Mountain climber', '45s', { videoId: 'KLTY9yjk7jE', videoBy: 'Demonstração em PT', metricType: 'time' }),
          ex('Polichinelo', '45s forte para fechar', { metricType: 'time' }),
        ],
      },
    ]),
    tpl('gab-2', 'gabriella', 'Treino 2', 'Pernas + glúteo com step', 45, [
      {
        title: 'Aquecimento',
        note: '~4 min',
        exercises: [
          ex('Polichinelo', '1 min', { metricType: 'time' }),
          ex('Agachamento sem peso + ponte de glúteo', '15 + 15 reps', { note: 'Acorda quadríceps e glúteo antes da carga.' }),
          ex('Subida leve no step', '30s alternando as pernas', { metricType: 'time' }),
        ],
      },
      {
        title: 'Bloco 1 — 3 séries',
        note: 'descanse 1 min entre as séries',
        exercises: [
          ex('Subida no step com halteres', '10 por perna', { note: 'Suba empurrando pelo calcanhar da perna de cima; desça controlando.', videoId: '66WViRO93qs', videoBy: 'Solinca Fitness', tracksLoad: true }),
          ex('Stiff com halteres', '12 reps', { note: 'Quadril para trás, costas neutras, halteres deslizando pela coxa.', videoId: 'cETLf4xXYCQ', videoBy: 'Miqueias Alves Personal', tracksLoad: true }),
          ex('Abdominal infra', '20 reps', { note: 'Eleve as pernas; lombar colada no chão o tempo todo.', videoId: 'oq4Xb_xI618', videoBy: 'Demonstração em PT' }),
        ],
      },
      {
        title: 'Bloco 2 — 3 séries',
        note: 'descanse 1 min entre as séries',
        exercises: [
          ex('Agachamento búlgaro no step', '8 por perna · halteres nas mãos', { note: 'Peito do pé de trás no step. O mais difícil do treino — capricha na postura.', videoId: 'IL4ebT8L1aQ', videoBy: 'Demonstração em PT', tracksLoad: true }),
          ex('Elevação pélvica com pés no step', '16 reps · halter no quadril', { note: 'Aperte o glúteo 1s no topo de cada repetição.', videoId: 'Lx4X8k3r_HQ', videoBy: 'Demonstração em PT', tracksLoad: true }),
          ex('Prancha frontal', '30–40s', { videoId: 'Yu0wjtD5FkU', videoBy: 'Demonstração em PT', metricType: 'time' }),
        ],
      },
      {
        title: 'Bloco 3 — 3 séries',
        note: 'descanse 1 min entre as séries',
        exercises: [
          ex('Agachamento sumô com halter', '12 reps', { note: 'Pés bem afastados, halter pendurado entre as pernas.', videoId: 'ED9NUglcBrs', videoBy: 'Miqueias Alves Personal', tracksLoad: true }),
          ex('Recuo com elevação frontal', '8 por perna', { note: 'Passo para trás no afundo e, ao subir, eleve os halteres à frente.', videoId: 'M68plqVSPuQ', videoBy: 'Demonstração (inglês)', tracksLoad: true }),
          ex('Salto alternado no step', '45 segundos', { note: 'Toques rápidos alternando os pés na borda do step.', videoId: 'iXthO5CwKYw', videoBy: 'Contours', metricType: 'time' }),
        ],
      },
      {
        title: 'Cardio final — 1x',
        note: '45s cada, 15s de troca · ~4 min',
        exercises: [
          ex('Salto alternado no step', '45s', { metricType: 'time' }),
          ex('Deslocamento lateral', '45s', { videoId: 'j6ZxI85pd7k', videoBy: 'Demonstração em PT', metricType: 'time' }),
          ex('Skipping', '45s', { metricType: 'time' }),
          ex('Burpee adaptado', '45s no seu ritmo', { videoId: 'T0-THMqJddI', videoBy: 'Versão iniciante em PT', metricType: 'time' }),
        ],
      },
    ]),
    tpl('gab-3', 'gabriella', 'Treino 3', 'Superior + core + cardio', 45, [
      {
        title: 'Aquecimento',
        note: '~4 min',
        exercises: [
          ex('Polichinelo', '1 min', { metricType: 'time' }),
          ex('Círculos de braço + rotação de tronco', '45s cada', { metricType: 'time' }),
          ex('Prancha', '20s para ativar o core', { metricType: 'time' }),
        ],
      },
      {
        title: 'Bloco 1 — 3 séries',
        note: 'descanse 1 min entre as séries',
        exercises: [
          ex('Desenvolvimento de ombros em pé', '12 reps', { note: 'Abdômen firme para não arquear a lombar ao empurrar.', videoId: '3ZwwrTtnGJo', videoBy: 'Demonstração em PT', tracksLoad: true }),
          ex('Remada curvada com halteres', '12 reps', { note: 'Tronco inclinado, costas retas, cotovelos rentes ao corpo.', videoId: 'cCpzwQnWTdU', videoBy: 'Fisioprev com Ju e Fran', tracksLoad: true }),
          ex('Abdominal remador', '20 reps', { videoId: 'eTfET_z6Oyw', videoBy: 'Treino Correto' }),
        ],
      },
      {
        title: 'Bloco 2 — 3 séries',
        note: 'descanse 1 min entre as séries',
        exercises: [
          ex('Rosca direta com halteres', '12 reps', { note: 'Cotovelos colados no corpo; sem balançar o tronco.', videoId: 'Hh0PlkYYOGI', videoBy: 'Fisioprev com Ju e Fran', tracksLoad: true }),
          ex('Tríceps testa no chão', '15 reps', { note: 'Desça os halteres em direção à testa dobrando só os cotovelos.', videoId: '5U8kWohXI2M', videoBy: 'Demonstração em PT', tracksLoad: true }),
          ex('Remada alternada em prancha', '10 por lado', { videoId: 'rcDXs9JL4xI', videoBy: 'Rafa Leite', tracksLoad: true }),
        ],
      },
      {
        title: 'Bloco 3 — 3 séries',
        note: 'descanse 1 min entre as séries',
        exercises: [
          ex('Elevação lateral', '12 reps · halteres leves', { note: 'Suba até a altura dos ombros, desça devagar.', videoId: 'fWSKF_jDk0M', videoBy: 'Demonstração em PT', tracksLoad: true }),
          ex('Supino no chão com halteres', '15 reps', { videoId: 'k1hzEiVnJ40', videoBy: 'Demonstração em PT', tracksLoad: true }),
          ex('Prancha com toque no ombro', '30 segundos', { videoId: 'tlq8yXV5ZV0', videoBy: 'Prof. Matheus Gomes', metricType: 'time' }),
        ],
      },
      {
        title: 'Cardio final — 1x',
        note: '45s cada, 15s de troca · ~4 min',
        exercises: [
          ex('Polichinelo', '45s', { metricType: 'time' }),
          ex('Mountain climber', '45s', { metricType: 'time' }),
          ex('Agachamento com salto', '45s', { metricType: 'time' }),
          ex('Skipping', '45s — tudo que sobrou!', { metricType: 'time' }),
        ],
      },
    ]),
    tpl('gab-4', 'gabriella', 'Treino 4', 'Circuito da Madi (full body)', 45, [
      {
        title: 'Aquecimento',
        note: '~4 min',
        exercises: [
          ex('Polichinelo', '1 min', { metricType: 'time' }),
          ex('Agachamento sem peso', '15 reps'),
          ex('Círculos de braço + balanço de perna', '30s cada', { note: 'O circuito começa acima da cabeça — aqueça bem os ombros.', metricType: 'time' }),
        ],
      },
      {
        title: 'Circuito — 3 a 4 voltas',
        note: '10–12 reps por exercício · 1 min de descanso entre as voltas',
        exercises: [
          ex('Sumô com elevação acima da cabeça', '10–12 reps · anilha ou halter', { note: 'Sumô bem aberto; ao subir, leve a carga esticada até acima da cabeça.', videoId: 'UuQ2dHOSU4E', videoBy: 'Live Lean TV (inglês)', tracksLoad: true }),
          ex('Recuo com rosca martelo', '10–12 reps (5–6 por perna)', { note: 'Afundo para trás com rosca de pegada neutra ao mesmo tempo.', videoId: 'z9NxkSzQVTw', videoBy: 'Prof. Matheus Gomes', tracksLoad: true }),
          ex('Stiff com halteres', '10–12 reps', { note: 'Quadril para trás, costas neutras, até sentir o posterior.', videoId: 'cETLf4xXYCQ', videoBy: 'Miqueias Alves Personal', tracksLoad: true }),
          ex('Remada curvada com halteres', '10–12 reps', { note: 'Do tronco inclinado do stiff, puxe os cotovelos para trás.', videoId: 'cCpzwQnWTdU', videoBy: 'Fisioprev com Ju e Fran', tracksLoad: true }),
          ex('Goblet squat', '10–12 reps · kettlebell ou halter no peito', { note: 'Desça fundo mantendo o tronco ereto.', videoId: 'Nx3czyxDjVY', videoBy: 'Pedro Almeida · Mentor Fitness', tracksLoad: true }),
          ex('Mountain climber', '10–12 por perna', { note: 'Joelhos ao peito em ritmo forte, sem levantar o quadril.', videoId: 'KLTY9yjk7jE', videoBy: 'Demonstração em PT' }),
          ex('Remada alternada em prancha (renegade row)', '10–12 por lado', { note: 'Quadril travado. Fecha a volta com o core em fogo.', videoId: 'rcDXs9JL4xI', videoBy: 'Rafa Leite', tracksLoad: true }),
        ],
      },
    ]),
    tpl('gab-5', 'gabriella', 'Treino 5', 'Leg day da Madi (pernas + glúteo)', 45, [
      {
        title: 'Aquecimento',
        note: '~4 min',
        exercises: [
          ex('Polichinelo', '1 min', { metricType: 'time' }),
          ex('Agachamento sem peso + ponte de glúteo', '15 + 15 reps', { note: 'Acorda quadríceps, posterior e glúteo antes da carga.' }),
          ex('Balanço de perna + rotação de quadril', '30s cada lado', { metricType: 'time' }),
        ],
      },
      {
        title: 'Circuito — 3 voltas',
        note: '10–12 reps por exercício, ritmo lento · 1 min entre as voltas',
        exercises: [
          ex('Agachamento frontal com halteres', '10–12 reps · halteres nos ombros', { note: 'Desça devagar, tronco ereto, posição de front rack.', videoId: '_WcnmJ87zpk', videoBy: 'Demonstração em PT', tracksLoad: true }),
          ex('Agachamento sumô com halteres', '10–12 reps · pés bem afastados', { note: 'Joelhos para fora, desce fundo e sobe apertando o glúteo.', videoId: 'ED9NUglcBrs', videoBy: 'Miqueias Alves Personal', tracksLoad: true }),
          ex('Stiff (terra romeno) com halteres', '10–12 reps', { note: 'Bem devagar na descida, halteres rente às pernas.', videoId: 'cETLf4xXYCQ', videoBy: 'Miqueias Alves Personal', tracksLoad: true }),
          ex('Passada com halteres (walking lunge)', '10–12 por perna', { note: 'Joelho de trás quase tocando o chão. Sem espaço? Avanço no lugar.', videoId: '2bJnGeIkcIA', videoBy: 'Passada com halteres (PT)', tracksLoad: true }),
        ],
      },
    ]),
  ]
}
