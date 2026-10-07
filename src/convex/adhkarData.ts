export type AdhkarSession = "morning" | "evening";

export type AdhkarInvocation = {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  repetitions: number;
  source: string;
};

const commonInvocations: AdhkarInvocation[] = [
  {
    id: "protection",
    title: "Au nom d’Allah, rien ne peut nuire",
    arabic:
      "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration:
      "Bismillahi alladhi la yadurru ma'a ismihi shay'un fil-ardi wa la fis-sama'i wa huwa as-sami'u al-'alim",
    meaning:
      "Au nom d’Allah, avec le nom de qui rien ne peut nuire sur terre ni dans le ciel. Il est Celui qui entend tout et sait tout.",
    repetitions: 3,
    source: "Sunan Abi Dawud 5088 · Jami‘ at-Tirmidhi 3388",
  },
  {
    id: "contentment",
    title: "Une parole de confiance",
    arabic:
      "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا",
    transliteration:
      "Raditu billahi rabban, wa bil-islami dinan, wa bi-Muhammadin nabiyyan",
    meaning:
      "J’agrée Allah comme Seigneur, l’islam comme religion et Muhammad comme prophète.",
    repetitions: 3,
    source: "Sunan Abi Dawud 5072 · Jami‘ at-Tirmidhi 3389",
  },
  {
    id: "master-of-forgiveness",
    title: "La demande de pardon maîtresse",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika ma istata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bi-ni'matika 'alayya wa abu'u bi-dhanbi faghfir li fa-innahu la yaghfiru adh-dhunuba illa anta.",
    meaning:
      "Ô Allah, Tu es mon Seigneur, nul n’est digne d’adoration sauf Toi. Tu m’as créé et je suis Ton serviteur. Je m’efforce de respecter mon engagement envers Toi. Je cherche refuge auprès de Toi contre le mal que j’ai commis. Je reconnais Tes bienfaits envers moi et reconnais mes fautes. Pardonne-moi : nul ne pardonne les péchés si ce n’est Toi.",
    repetitions: 1,
    source: "Sahih al-Bukhari 6306",
  },
];

export const adhkarBySession: Record<AdhkarSession, AdhkarInvocation[]> = {
  morning: [
    ...commonInvocations,
    {
      id: "morning-opening",
      title: "Au matin",
      arabic:
        "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
      transliteration:
        "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilayka an-nushur",
      meaning:
        "Ô Allah, c’est par Toi que nous atteignons le matin et le soir, c’est par Toi que nous vivons et mourons, et c’est vers Toi que sera la résurrection.",
      repetitions: 1,
      source: "Jami‘ at-Tirmidhi 3391",
    },
  ],
  evening: [
    ...commonInvocations,
    {
      id: "evening-opening",
      title: "Au soir",
      arabic:
        "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
      transliteration:
        "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilayka al-masir",
      meaning:
        "Ô Allah, c’est par Toi que nous atteignons le soir et le matin, c’est par Toi que nous vivons et mourons, et c’est vers Toi que sera le retour.",
      repetitions: 1,
      source: "Jami‘ at-Tirmidhi 3391",
    },
  ],
};
