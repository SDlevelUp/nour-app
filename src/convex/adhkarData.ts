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

const muslimGrade = [{ by: "Muslim", grade: "sahih (recueil authentique)" }];

const knowerOfTheUnseen: Invocation = {
  id: "knower-of-the-unseen",
  title: "Créateur des cieux et de la terre",
  arabic:
    "اللَّهُمَّ فَاطِرَ السَّمَوَاتِ وَالْأَرْضِ، عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَشَرِّ الشَّيْطَانِ وَشِرْكِهِ",
  transliteration:
    "Allahumma fatira as-samawati wal-ard, 'alima al-ghaybi wash-shahada, rabba kulli shay'in wa malikah, ashhadu an la ilaha illa ant, a'udhu bika min sharri nafsi wa sharri ash-shaytani wa shirkih",
  meaning:
    "Ô Allah, Créateur des cieux et de la terre, Connaisseur de l’invisible et du visible, Seigneur et Souverain de toute chose, j’atteste que nul n’est digne d’adoration sauf Toi. Je cherche refuge auprès de Toi contre le mal de mon âme, contre le mal de Satan et contre ce qu’il appelle à associer.",
  repetitions: 1,
  proof: {
    narrator: "Abu Hurayra, rapportant la demande d’Abu Bakr as-Siddiq",
    sources: [
      {
        collection: "Sunan Abi Dawud",
        number: "5067",
        grades: [
          { by: "al-Albani", grade: "sahih" },
          { by: "Zubair Ali Zai", grade: "sahih" },
        ],
      },
      {
        collection: "Jami‘ at-Tirmidhi",
        number: "3392",
        grades: [
          { by: "al-Albani", grade: "sahih" },
          { by: "Ahmad Shakir", grade: "sahih" },
        ],
      },
    ],
    note: "Le matin, le soir et au coucher, d’après le texte du hadith.",
  },
};

const wellBeing: Invocation = {
  id: "well-being",
  title: "Le pardon et la préservation",
  arabic:
    "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، وَاحْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
  transliteration:
    "Allahumma inni as'aluka al-'afwa wal-'afiyata fid-dunya wal-akhira. Allahumma inni as'aluka al-'afwa wal-'afiyata fi dini wa dunyaya wa ahli wa mali. Allahumma-stur 'awrati wa amin raw'ati, wahfadhni min bayni yadayya wa min khalfi wa 'an yamini wa 'an shimali wa min fawqi, wa a'udhu bika an ughtala min tahti",
  meaning:
    "Ô Allah, je Te demande le pardon et la préservation dans ce monde et dans l’au-delà. Ô Allah, je Te demande le pardon et la préservation dans ma religion, ma vie, ma famille et mes biens. Ô Allah, couvre mes défauts et apaise mes craintes. Protège-moi par-devant, par-derrière, à ma droite, à ma gauche et d’au-dessus de moi, et je cherche refuge auprès de Toi contre le fait d’être saisie par-dessous.",
  repetitions: 1,
  proof: {
    narrator: "‘Abdullah ibn ‘Umar",
    sources: [
      {
        collection: "Sunan Ibn Majah",
        number: "3871",
        grades: [
          { by: "al-Albani", grade: "sahih" },
          { by: "Shu‘ayb al-Arna’ut", grade: "sahih" },
        ],
      },
      {
        collection: "Sunan Abi Dawud",
        number: "5074",
        grades: [
          { by: "al-Albani", grade: "sahih" },
          { by: "Shu‘ayb al-Arna’ut", grade: "sahih" },
        ],
      },
    ],
    note: "Le Prophète ﷺ ne délaissait pas ces invocations, le soir et le matin. Texte selon Ibn Majah ; Abu Dawud rapporte « bi-‘azamatika » (par Ta grandeur) à la fin.",
  },
};

const protectiveSurahs: Invocation = {
  id: "protective-surahs",
  title: "Al-Ikhlas, al-Falaq et an-Nas",
  arabic:
    "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ — قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ — قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
  transliteration:
    "Qul huwa Allahu ahad… — Qul a'udhu bi-rabbi al-falaq… — Qul a'udhu bi-rabbi an-nas…",
  meaning:
    "Les trois dernières sourates du Coran (112, 113 et 114), à réciter chacune trois fois.",
  repetitions: 3,
  proof: {
    narrator: "‘Abdullah ibn Khubayb",
    sources: [
      {
        collection: "Sunan Abi Dawud",
        number: "5082",
        grades: [
          { by: "al-Albani", grade: "hasan" },
          { by: "Shu‘ayb al-Arna’ut", grade: "hasan sahih" },
        ],
      },
      {
        collection: "Jami‘ at-Tirmidhi",
        number: "3575",
        grades: [
          { by: "al-Albani", grade: "hasan" },
          { by: "Ahmad Shakir", grade: "hasan" },
        ],
      },
    ],
    note: "« Trois fois le soir et le matin, elles te suffiront contre toute chose. »",
  },
};

const glorification: Invocation = {
  id: "glorification-100",
  title: "Gloire et louange à Allah",
  arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
  transliteration: "Subhana Allahi wa bi-hamdih",
  meaning: "Gloire et pureté à Allah, et louange à Lui.",
  repetitions: 100,
  proof: {
    narrator: "Abu Hurayra",
    sources: [{ collection: "Sahih Muslim", number: "2692", grades: muslimGrade }],
    note: "Cent fois le matin et le soir : nul ne viendra le Jour de la Résurrection avec mieux, sauf celui qui en aura dit autant ou davantage.",
  },
};

const sovereigntyProof: AdhkarInvocation["proof"] = {
  narrator: "‘Abdullah ibn Mas‘ud",
  sources: [
    { collection: "Sahih Muslim", number: "2723", grades: muslimGrade },
    {
      collection: "Sunan Abi Dawud",
      number: "5071",
      grades: [{ by: "al-Albani", grade: "sahih" }],
    },
  ],
  note: "Le hadith donne le texte du soir et précise qu’au matin, le Prophète ﷺ disait la même chose en commençant par « asbahna wa asbaha al-mulku lillah ». Dans la version du matin, « cette nuit » devient « ce jour », comme le reprennent les recueils d’invocations.",
};

const withMoment = (
  invocation: Invocation,
  moment: AdhkarSession,
): AdhkarInvocation => ({ ...invocation, moment });

const [protection, masterOfForgiveness] = commonInvocations;

export const adhkarBySession: Record<AdhkarSession, AdhkarInvocation[]> = {
  morning: [
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
    {
      id: "morning-sovereignty",
      title: "Le matin, la royauté appartient à Allah",
      arabic:
        "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
      transliteration:
        "Asbahna wa asbaha al-mulku lillah, wal-hamdu lillah, la ilaha illa Allahu wahdahu la sharika lah, lahu al-mulku wa lahu al-hamdu wa huwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadha al-yawmi wa khayra ma ba'dah, wa a'udhu bika min sharri ma fi hadha al-yawmi wa sharri ma ba'dah. Rabbi a'udhu bika min al-kasali wa su'i al-kibar. Rabbi a'udhu bika min 'adhabin fin-nari wa 'adhabin fil-qabr",
      meaning:
        "Nous voici au matin, et la royauté appartient à Allah. Louange à Allah, nul n’est digne d’adoration sauf Allah, Seul, sans associé ; à Lui la royauté et la louange, et Il est capable de toute chose. Seigneur, je Te demande le bien de ce jour et de ce qui le suit, et je cherche refuge auprès de Toi contre le mal de ce jour et de ce qui le suit. Seigneur, je cherche refuge auprès de Toi contre la paresse et les maux de la vieillesse. Seigneur, je cherche refuge auprès de Toi contre un châtiment dans le Feu et un châtiment dans la tombe.",
      repetitions: 1,
      proof: sovereigntyProof,
    },
    masterOfForgiveness,
    knowerOfTheUnseen,
    wellBeing,
    protection,
    protectiveSurahs,
    glorification,
    {
      id: "juwayriya",
      title: "Quatre paroles qui pèsent lourd",
      arabic:
        "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
      transliteration:
        "Subhana Allahi wa bi-hamdihi 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatih",
      meaning:
        "Gloire et louange à Allah, autant que le nombre de Ses créatures, autant qu’il Lui plaît, autant que le poids de Son Trône et autant que l’encre de Ses paroles.",
      repetitions: 3,
      proof: {
        narrator: "Juwayriya bint al-Harith",
        sources: [{ collection: "Sahih Muslim", number: "2726", grades: muslimGrade }],
        note: "Dites par le Prophète ﷺ après la prière du Fajr, trois fois : elles pèsent plus lourd que tout ce qu’elle avait dit depuis le matin.",
      },
    },
  ].map((invocation) => withMoment(invocation, "morning")),
  evening: [
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
    {
      id: "evening-sovereignty",
      title: "Le soir, la royauté appartient à Allah",
      arabic:
        "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
      transliteration:
        "Amsayna wa amsa al-mulku lillah, wal-hamdu lillah, la ilaha illa Allahu wahdahu la sharika lah, lahu al-mulku wa lahu al-hamdu wa huwa 'ala kulli shay'in qadir. Rabbi as'aluka khayra ma fi hadhihi al-laylati wa khayra ma ba'daha, wa a'udhu bika min sharri ma fi hadhihi al-laylati wa sharri ma ba'daha. Rabbi a'udhu bika min al-kasali wa su'i al-kibar. Rabbi a'udhu bika min 'adhabin fin-nari wa 'adhabin fil-qabr",
      meaning:
        "Nous voici au soir, et la royauté appartient à Allah. Louange à Allah, nul n’est digne d’adoration sauf Allah, Seul, sans associé ; à Lui la royauté et la louange, et Il est capable de toute chose. Seigneur, je Te demande le bien de cette nuit et de ce qui la suit, et je cherche refuge auprès de Toi contre le mal de cette nuit et de ce qui la suit. Seigneur, je cherche refuge auprès de Toi contre la paresse et les maux de la vieillesse. Seigneur, je cherche refuge auprès de Toi contre un châtiment dans le Feu et un châtiment dans la tombe.",
      repetitions: 1,
      proof: sovereigntyProof,
    },
    masterOfForgiveness,
    knowerOfTheUnseen,
    wellBeing,
    protection,
    protectiveSurahs,
    {
      id: "perfect-words",
      title: "Refuge dans les paroles parfaites d’Allah",
      arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      transliteration: "A'udhu bi-kalimati Allahi at-tammati min sharri ma khalaq",
      meaning:
        "Je cherche refuge dans les paroles parfaites d’Allah contre le mal de ce qu’Il a créé.",
      repetitions: 1,
      proof: {
        narrator: "Abu Hurayra",
        sources: [{ collection: "Sahih Muslim", number: "2709", grades: muslimGrade }],
        note: "À un homme piqué par un scorpion pendant la nuit : « Si tu avais dit, en arrivant au soir… rien ne t’aurait nui. » Le hadith de Muslim ne précise pas de nombre de répétitions.",
      },
    },
    glorification,
  ].map((invocation) => withMoment(invocation, "evening")),
};
