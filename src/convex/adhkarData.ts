export type AdhkarSession = "morning" | "evening";

// Classification telle que publiée par sunnah.com (numérotation sunnah.com).
export type HadithSource = {
  collection: string;
  number: string;
  grades: { by: string; grade: string }[];
};

export type AdhkarInvocation = {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  repetitions: number;
  moment: AdhkarSession;
  proof: {
    narrator: string;
    sources: HadithSource[];
    note?: string;
  };
};

type Invocation = Omit<AdhkarInvocation, "moment">;

const commonInvocations: Invocation[] = [
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
    proof: {
      narrator: "‘Uthman ibn ‘Affan",
      sources: [
        {
          collection: "Sunan Abi Dawud",
          number: "5088",
          grades: [
            { by: "al-Albani", grade: "sahih" },
            { by: "Zubair Ali Zai", grade: "sahih" },
          ],
        },
        {
          collection: "Jami‘ at-Tirmidhi",
          number: "3388",
          grades: [
            { by: "at-Tirmidhi", grade: "hasan sahih gharib" },
            { by: "al-Albani", grade: "hasan sahih" },
            { by: "Ahmad Shakir", grade: "hasan sahih" },
          ],
        },
      ],
      note: "Trois fois le matin et trois fois le soir, d’après le texte des deux hadiths.",
    },
  },
  {
    id: "master-of-forgiveness",
    title: "La demande de pardon maîtresse",
    arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration:
      "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika ma istata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bi-ni'matika 'alayya wa abu'u laka bi-dhanbi faghfir li fa-innahu la yaghfiru adh-dhunuba illa anta.",
    meaning:
      "Ô Allah, Tu es mon Seigneur, nul n’est digne d’adoration sauf Toi. Tu m’as créé et je suis Ton serviteur. Je m’efforce de respecter mon engagement envers Toi. Je cherche refuge auprès de Toi contre le mal que j’ai commis. Je reconnais devant Toi Tes bienfaits envers moi et je reconnais devant Toi mes fautes. Pardonne-moi : nul ne pardonne les péchés si ce n’est Toi.",
    repetitions: 1,
    proof: {
      narrator: "Shaddad ibn Aws",
      sources: [
        {
          collection: "Sahih al-Bukhari",
          number: "6306",
          grades: [{ by: "al-Bukhari", grade: "sahih (recueil authentique)" }],
        },
      ],
      note: "Le hadith mentionne celui qui la dit le jour avec certitude, et celui qui la dit la nuit.",
    },
  },
];

const openingProof: AdhkarInvocation["proof"] = {
  narrator: "Abu Hurayra",
  sources: [
    {
      collection: "Jami‘ at-Tirmidhi",
      number: "3391",
      grades: [
        { by: "at-Tirmidhi", grade: "hasan" },
        { by: "al-Albani", grade: "sahih" },
        { by: "Ahmad Shakir", grade: "sahih" },
      ],
    },
  ],
  note: "Texte selon at-Tirmidhi : le matin se termine par « al-masir », le soir par « an-nushur ». Abu Dawud (5068) rapporte une variante.",
};

const withMoment = (
  invocation: Invocation,
  moment: AdhkarSession,
): AdhkarInvocation => ({ ...invocation, moment });

export const adhkarBySession: Record<AdhkarSession, AdhkarInvocation[]> = {
  morning: [
    ...commonInvocations.map((invocation) => withMoment(invocation, "morning")),
    withMoment(
      {
        id: "morning-opening",
        title: "Au matin",
        arabic:
          "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
        transliteration:
          "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilayka al-masir",
        meaning:
          "Ô Allah, c’est par Toi que nous atteignons le matin et le soir, c’est par Toi que nous vivons et mourons, et c’est vers Toi que sera le retour.",
        repetitions: 1,
        proof: openingProof,
      },
      "morning",
    ),
  ],
  evening: [
    ...commonInvocations.map((invocation) => withMoment(invocation, "evening")),
    withMoment(
      {
        id: "evening-opening",
        title: "Au soir",
        arabic:
          "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
        transliteration:
          "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilayka an-nushur",
        meaning:
          "Ô Allah, c’est par Toi que nous atteignons le soir et le matin, c’est par Toi que nous vivons et mourons, et c’est vers Toi que sera la résurrection.",
        repetitions: 1,
        proof: openingProof,
      },
      "evening",
    ),
  ],
};
