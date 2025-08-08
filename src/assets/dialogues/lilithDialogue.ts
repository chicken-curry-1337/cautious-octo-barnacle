import { LILITH_ID, lilithCharacter } from '../characters/lilith';
import { PLAYER_ID, playerCharacter } from '../characters/player';

export const lilithIntroDialogue = {
  characters: [
    lilithCharacter,
    playerCharacter,
  ],

  nodes: [
    {
      id: 'start',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID],
      activeCharacterIds: [],
      text: 'Коридор университета. Фин выходит, держа папку под мышкой, на лице смесь раздражения и усталости. Лилит, стоящая у стены с идеально ровной осанкой, отрывается от какой-то книги и смотрит на него.',
      options: [],
    },
    {
      id: '1',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID],
      activeCharacterIds: [LILITH_ID],
      text: '(спокойно, слегка приподняв бровь) Предполагаю, беседа была… насыщенной?',
      options: [],
    },
    {
      id: '2',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '(резко выдыхает, чуть криво усмехнувшись) Если под «насыщенной» ты подразумеваешь то, что меня только что выпнули в самую богом забытую дыру королевства — то да, всё прошло просто прекрасно.',
      options: [],
    },
    {
      id: '3',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID],
      activeCharacterIds: [LILITH_ID],
      text: '(закрывает книгу, пряча её под мышку) Любопытно. И что, по их мнению, вы должны там делать?',
      options: [],
    },
    {
      id: '4',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: '(с сарказмом) Поднимать из руин гильдию, которую прежний управляющий развалил и сбежал. Видимо, они решили, что если я смог испортить жизнь парочке сытых аристократических отпрысков, то справлюсь и с разваленным хозяйством.',
      options: [],
    },
    {
      id: '5',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID],
      activeCharacterIds: [LILITH_ID],
      text: '(чуть улыбается уголком губ, но голос всё так же ровный) Значит, у нас будет возможность проявить себя… и заодно испортить жизнь ещё кому-нибудь.',
      options: [],
    },
    {
      id: '6',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID],
      activeCharacterIds: [PLAYER_ID],
      text: 'Ты же понимаешь, что это не аванс — это ссылка.',
      options: [],
    },
    {
      id: '7',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID],
      activeCharacterIds: [LILITH_ID],
      text: 'Любая ссылка может стать плацдармом. Главное — кто первым начнёт диктовать правила.',
      options: [],
    },
    {
      id: '8',
      visibleCharacterIds: [LILITH_ID, PLAYER_ID],
      activeCharacterIds: [LILITH_ID],
      text: 'Ладно… поехали диктовать.',
      options: [],
    },
  ],
};
