import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { container } from 'tsyringe';

import { DialogueStore } from '../../entities/Dialogue/Dialogue.store';

import styles from './DialogueWidget.module.css';

export const DialogueWidget = observer(() => {
  const dialogueStore = useMemo(() => container.resolve(DialogueStore), []);
  const currentNode = dialogueStore.currentNode;
  const characters = dialogueStore.visibleCharacters;
  const activeCharacters = dialogueStore.activeCharacters;

  const handleDialogueClick = () => {
    if (currentNode?.options.length === 0 || currentNode?.isLast) dialogueStore.nextNode();
  };

  if (!currentNode || !characters) return null;

  return (
    <div className={styles.container} onClick={handleDialogueClick}>
      <div className={styles.characters}>
        {characters.map((char) => {
          // Активен, если его id есть в массиве activeCharacterIds
          const isActive = currentNode.activeCharacterIds.includes(char.id);

          return (
            <img
              key={char.id}
              src={char.avatarUrl}
              alt={char.name}
              title={char.name}
              className={`${styles.characterImg} ${
                isActive
                  ? styles.characterImgActive
                  : styles.characterImgInactive
              }`}
            />
          );
        })}
      </div>

      <div className={styles.text}>
        <div
          className={styles.textWrapper}
          style={{
            cursor: currentNode.options.length <= 1 ? 'pointer' : 'default',
          }}
        >
          <div className={styles.textName}>
            {activeCharacters.map((char, index) => {
              return (
                <span key={char.id}>
                  {index > 0 ? ', ' : ''}
                  <span
                    key={char.id}
                  >
                    {char.name}
                  </span>
                </span>
              );
            })}
          </div>
          <div className={styles.textContent}>{currentNode.text}</div>
        </div>
      </div>

      <div className={styles.options}>
        {currentNode.options.length > 0
          && currentNode.options.map((option, index) => (
            <button
              key={index}
              onClick={() => dialogueStore.setCurrentId(option.nextId)}
              className={styles.button}
            >
              {option.text}
            </button>
          ))}
      </div>
    </div>
  );
});
