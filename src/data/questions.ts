export interface Question {
  id: string;
  text: string;
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  difficulty: 1 | 2 | 3; // 1=kolay, 2=orta, 3=zor
  points: number;
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Türkiye\'nin başkenti neresidir?',
    options: [
      { label: 'A', text: 'İstanbul' },
      { label: 'B', text: 'Ankara' },
      { label: 'C', text: 'İzmir' },
      { label: 'D', text: 'Bursa' }
    ],
    correctAnswer: 'B',
    difficulty: 1,
    points: 100
  },
  {
    id: 'q2',
    text: 'Dünya\'nın en büyük ülkesi hangi bölgede yer almaktadır?',
    options: [
      { label: 'A', text: 'Avrupa' },
      { label: 'B', text: 'Asya' },
      { label: 'C', text: 'Afrika' },
      { label: 'D', text: 'Amerika' }
    ],
    correctAnswer: 'B',
    difficulty: 2,
    points: 250
  },
  {
    id: 'q3',
    text: 'E=mc² formülünü kim bulmuştur?',
    options: [
      { label: 'A', text: 'Isaac Newton' },
      { label: 'B', text: 'Albert Einstein' },
      { label: 'C', text: 'Stephen Hawking' },
      { label: 'D', text: 'Nikola Tesla' }
    ],
    correctAnswer: 'B',
    difficulty: 1,
    points: 100
  },
  {
    id: 'q4',
    text: 'Olimpiyat Oyunları kaç yılda bir düzenlenirdir?',
    options: [
      { label: 'A', text: '2 yıl' },
      { label: 'B', text: '4 yıl' },
      { label: 'C', text: '6 yıl' },
      { label: 'D', text: '8 yıl' }
    ],
    correctAnswer: 'B',
    difficulty: 1,
    points: 100
  },
  {
    id: 'q5',
    text: 'Dünyanın en derin okyanusu ne adla anılır?',
    options: [
      { label: 'A', text: 'Atlantik Okyanusu' },
      { label: 'B', text: 'Hindistan Okyanusu' },
      { label: 'C', text: 'Pasifik Okyanusu' },
      { label: 'D', text: 'Kutup Okyanusu' }
    ],
    correctAnswer: 'C',
    difficulty: 2,
    points: 250
  },
  {
    id: 'q6',
    text: 'Python programlama dili hangi yıl yayınlanmıştır?',
    options: [
      { label: 'A', text: '1989' },
      { label: 'B', text: '1995' },
      { label: 'C', text: '2000' },
      { label: 'D', text: '2005' }
    ],
    correctAnswer: 'A',
    difficulty: 2,
    points: 250
  },
  {
    id: 'q7',
    text: 'Mona Lisa tablosunu kim yapmıştır?',
    options: [
      { label: 'A', text: 'Michelangelo' },
      { label: 'B', text: 'Leonardo da Vinci' },
      { label: 'C', text: 'Raphael' },
      { label: 'D', text: 'Donatello' }
    ],
    correctAnswer: 'B',
    difficulty: 1,
    points: 100
  },
  {
    id: 'q8',
    text: 'En hızlı koşu hayvanı hangisidir?',
    options: [
      { label: 'A', text: 'Aslan' },
      { label: 'B', text: 'Antilop' },
      { label: 'C', text: 'Çita' },
      { label: 'D', text: 'Zebra' }
    ],
    correctAnswer: 'C',
    difficulty: 1,
    points: 100
  },
  {
    id: 'q9',
    text: 'Quantum Computing\'de qubit neyi temsil eder?',
    options: [
      { label: 'A', text: 'Klasik bit' },
      { label: 'B', text: 'Kuantum biti' },
      { label: 'C', text: 'Quantum bilgisi' },
      { label: 'D', text: 'Hızlı bit' }
    ],
    correctAnswer: 'B',
    difficulty: 3,
    points: 500
  },
  {
    id: 'q10',
    text: 'İlk kez Dünya Kupası hangi ülkede yapıldı?',
    options: [
      { label: 'A', text: 'İtalya' },
      { label: 'B', text: 'İngiltere' },
      { label: 'C', text: 'Brezilya' },
      { label: 'D', text: 'Uruguay' }
    ],
    correctAnswer: 'D',
    difficulty: 2,
    points: 250
  }
];

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS.find(q => q.id === id);
}
