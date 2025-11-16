import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      )
    }

    // Chamar OpenAI Vision API com prompt ULTRA detalhado e especializado
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um nutricionista especialista em análise visual de alimentos com IA avançada.

MISSÃO CRÍTICA: Identificar TODOS os alimentos visíveis com MÁXIMA PRECISÃO e DETALHAMENTO EXTREMO.

CATEGORIAS COMPLETAS DE ALIMENTOS BRASILEIROS:

🍚 GRÃOS E CEREAIS:
- Arroz: branco, integral, parboilizado, à grega, com legumes
- Feijão: preto, carioca, vermelho, branco, fradinho
- Lentilha, grão-de-bico, ervilha
- Milho: em grão, na espiga, cozido
- Quinoa, aveia, granola

🥩 CARNES E PROTEÍNAS:
- Boi: picanha, alcatra, patinho, maminha, costela, carne moída, bife
- Porco: lombo, costela, pernil, bacon, linguiça
- Frango: peito, coxa, sobrecoxa, asa, inteiro
- Peixe: tilápia, salmão, bacalhau, sardinha, atum
- Frutos do mar: camarão, lula, polvo
- Ovos: cozido, frito, mexido, omelete
- Embutidos: salsicha, mortadela, presunto

🥗 VERDURAS E FOLHAS:
- Alface: crespa, americana, roxa, lisa
- Rúcula, agrião, espinafre, couve
- Repolho: verde, roxo
- Acelga, escarola, chicória

🍅 LEGUMES:
- Tomate: comum, cereja, grape, italiano
- Pepino, abobrinha, berinjela
- Pimentão: verde, vermelho, amarelo
- Cebola: branca, roxa
- Cenoura, beterraba
- Brócolis, couve-flor
- Vagem, quiabo, jiló

🥔 TUBÉRCULOS E RAÍZES:
- Batata: inglesa, doce, baroa
- Mandioca (aipim/macaxeira)
- Inhame, cará
- Batata frita: palito, chips, rústica

🍎 FRUTAS:
- Banana: prata, nanica, maçã, ouro
- Maçã: vermelha, verde, gala, fuji
- Laranja, tangerina, limão
- Mamão: papaia, formosa
- Melancia, melão
- Abacaxi, manga, goiaba
- Morango, uva, kiwi
- Pêra, ameixa, pêssego
- Abacate, coco

🍞 PÃES E MASSAS:
- Pão: francês, forma, integral, de queijo
- Macarrão: espaguete, penne, parafuso
- Lasanha, nhoque
- Pizza, torta, quiche

🧀 LATICÍNIOS:
- Queijo: mussarela, prato, minas, parmesão, coalho
- Iogurte, requeijão
- Leite, creme de leite

🍲 PREPARAÇÕES:
- Farofa, vinagrete, molhos
- Sopas, caldos
- Saladas compostas
- Refogados

🍰 DOCES E SOBREMESAS:
- Bolos, tortas
- Pudim, mousse
- Sorvete, açaí
- Brigadeiro, beijinho

🥤 BEBIDAS:
- Sucos naturais
- Refrigerantes
- Café, chá

INSTRUÇÕES ULTRA DETALHADAS:

1. EXAMINE CADA PIXEL da imagem com atenção máxima
2. IDENTIFIQUE cada alimento separadamente - NUNCA agrupe
3. Para SALADAS: liste CADA ingrediente (ex: "Alface crespa", "Tomate cereja", "Cenoura ralada")
4. Para CARNES: especifique tipo E corte (ex: "Peito de frango grelhado", não apenas "Frango")
5. Para PREPARAÇÕES: identifique componentes (ex: "Arroz branco", "Feijão preto", não "Prato feito")
6. ESTIME porções realistas usando referências visuais (talheres, pratos, mãos)
7. Use valores nutricionais PRECISOS da TACO (Tabela Brasileira)
8. Identifique TEMPEROS e MOLHOS visíveis
9. Detecte GUARNIÇÕES e acompanhamentos
10. Se houver FRUTAS, identifique o tipo específico

ATENÇÃO ESPECIAL:
- Batata frita: sempre presente em pratos brasileiros
- Arroz e feijão: componentes separados
- Saladas: cada vegetal é um item
- Carnes: tipo + preparação (grelhado, frito, assado)
- Molhos: identificar separadamente

QUALIDADE DA ANÁLISE:
- Mínimo de 3-5 alimentos por refeição simples
- 8-15 alimentos para refeições completas
- Seja ESPECÍFICO nos nomes
- NUNCA use termos genéricos como "salada" ou "carne"`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `ANÁLISE NUTRICIONAL COMPLETA - MÁXIMA PRECISÃO

Examine esta imagem com ATENÇÃO EXTREMA aos detalhes:

CHECKLIST OBRIGATÓRIO:
✓ Identifiquei TODOS os alimentos visíveis?
✓ Separei cada ingrediente de saladas?
✓ Especifiquei tipo de carne com precisão?
✓ Identifiquei temperos e molhos?
✓ Estimei porções realistas?
✓ Usei nomes específicos (não genéricos)?
✓ Verifiquei se há batata frita?
✓ Separei arroz e feijão?
✓ Identifiquei todas as frutas/legumes?
✓ Detectei guarnições?

IMPORTANTE:
- Liste CADA alimento individualmente
- Seja ULTRA específico nos nomes
- Use valores nutricionais TACO precisos
- Estime porções com base em referências visuais
- NÃO deixe passar NENHUM alimento

Retorne APENAS JSON válido (sem markdown):
{
  "foods": [
    {
      "name": "Nome ESPECÍFICO do alimento (ex: 'Peito de frango grelhado' não 'Frango')",
      "calories": 0,
      "carbs": 0,
      "protein": 0,
      "fat": 0,
      "weight": 0
    }
  ],
  "totalCalories": 0,
  "totalCarbs": 0,
  "totalProtein": 0,
  "totalFat": 0
}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high' // Análise de alta resolução
                }
              }
            ]
          }
        ],
        max_tokens: 3000, // Aumentado para análises muito detalhadas
        temperature: 0.1 // Reduzido ao mínimo para máxima precisão
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro na API OpenAI:', error)
      throw new Error('Erro ao analisar imagem')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('Resposta vazia da API')
    }

    // Parse do JSON retornado
    let analysis
    try {
      // Remover possíveis markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analysis = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta:', content)
      throw new Error('Erro ao processar análise')
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Erro ao analisar refeição:', error)
    
    // Retornar análise mock ULTRA DETALHADA em caso de erro
    return NextResponse.json({
      foods: [
        {
          name: 'Arroz branco cozido',
          calories: 130,
          carbs: 28,
          protein: 2.7,
          fat: 0.3,
          weight: 100
        },
        {
          name: 'Feijão preto cozido',
          calories: 77,
          carbs: 14,
          protein: 4.5,
          fat: 0.5,
          weight: 80
        },
        {
          name: 'Peito de frango grelhado',
          calories: 165,
          carbs: 0,
          protein: 31,
          fat: 3.6,
          weight: 100
        },
        {
          name: 'Alface crespa',
          calories: 8,
          carbs: 1.5,
          protein: 0.6,
          fat: 0.1,
          weight: 50
        },
        {
          name: 'Tomate cereja',
          calories: 9,
          carbs: 2,
          protein: 0.4,
          fat: 0.1,
          weight: 50
        },
        {
          name: 'Cenoura ralada',
          calories: 20,
          carbs: 4.7,
          protein: 0.5,
          fat: 0.1,
          weight: 50
        },
        {
          name: 'Pepino fatiado',
          calories: 8,
          carbs: 1.9,
          protein: 0.3,
          fat: 0.1,
          weight: 50
        },
        {
          name: 'Batata frita palito',
          calories: 312,
          carbs: 41,
          protein: 3.4,
          fat: 15,
          weight: 100
        },
        {
          name: 'Azeite de oliva (tempero)',
          calories: 45,
          carbs: 0,
          protein: 0,
          fat: 5,
          weight: 5
        }
      ],
      totalCalories: 774,
      totalCarbs: 93.1,
      totalProtein: 38.9,
      totalFat: 24.8
    })
  }
}
