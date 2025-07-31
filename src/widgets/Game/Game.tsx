import { observer } from "mobx-react-lite"
import { DialogueWidget, type DialogueNode } from "../DialogueWidget/DialogueWidget";
import { Guild } from "../Guild/Guild";
import { GuildStore } from "../../entities/Guild/Guild.store";
import HeroCreator from "../HeroCreator/HeroCreator";
import HeroList from "../HeroList/HeroList";
import CandidateList from "../CandidateList/CandidateList";
import QuestList from "../QuestList/QuestList";
import { Notifications } from "../Notification/Notification";

// Dialogue Data
const dialogueTree: DialogueNode[] = [
  {
    id: 'start',
    text: 'Привет, путник! Что тебя привело сюда?',
    options: [
      { text: 'Я просто осматриваюсь.', nextId: 'explore' },
      { text: 'Ищу приключения.', nextId: 'adventure' },
    ],
  },
  {
    id: 'explore',
    text: 'Здесь много интересного. Будь осторожен!',
    options: [
      { text: 'Спасибо за предупреждение.', nextId: 'end' },
    ],
  },
  {
    id: 'adventure',
    text: 'Ты нашёл то, что искал. Добро пожаловать в гильдию!',
    options: [
      { text: 'Я готов к испытаниям.', nextId: 'end' },
    ],
  },
  {
    id: 'end',
    text: 'Диалог завершён.',
    options: [],
  },
];


export const Game = observer(() => {
    return <div>

      <CandidateList />
        <HeroList />
        {/* <HeroCreator /> */}
        <Guild  />
        <QuestList />
        {/* <Notifications /> */}
        <DialogueWidget dialogueTree={dialogueTree} />
    </div>
})