import { yupResolver } from '@hookform/resolvers/yup';
import { observer } from 'mobx-react-lite';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import type { TUser, UserAbility } from '../../entities/User/User.store';
import styles from './CreateUser.module.css';

const nameSurnameSchema = yup.string().required().min(1);
const abilitySchema = yup.number().min(1).max(15).required();

const schema = yup
  .object({
    playerName: yup
      .object({
        name: nameSurnameSchema,
        surname: nameSurnameSchema,
      })
      .required(),
    userAbilities: yup
      .object({
        charisma: abilitySchema,
        constitution: abilitySchema,
        dexterity: abilitySchema,
        intelligence: abilitySchema,
        strength: abilitySchema,
        wisdom: abilitySchema,
      })
      .required(),
  })
  .required();

export const CreateUser = observer(
  ({
    createUser,
    defaultUser,
  }: {
    createUser(data: TUser): void;
    defaultUser: TUser;
  }) => {
    const { register, handleSubmit } = useForm({
      defaultValues: {
        ...defaultUser,
      },
      progressive: true,
      mode: 'onChange',
      resolver: yupResolver(schema),
    });

    const onSubmit: SubmitHandler<TUser> = (data) => {
      createUser(data);
    };

    // todo: добавить ошибки и обработку значений при изменении

    return (
      <form onSubmit={handleSubmit(onSubmit)} className={styles.createUser}>
        <div className={styles.createUserField}>
          <span>Name:</span>
          <input
            {...register('playerName.name', {
              minLength: 1,
              maxLength: 5,
              required: true,
            })}
          />
        </div>
        <div className={styles.createUserField}>
          <span>Surname:</span>
          <input
            {...register('playerName.surname', {
              minLength: 1,
              required: true,
            })}
          />
        </div>
        {Object.keys(defaultUser.userAbilities).map((key) => (
          <div className={styles.createUserField} key={key}>
            <span>{key}:</span>
            <input
              type="number"
              {...register(`userAbilities.${key as UserAbility}`, {
                min: 1,
                max: 15,
                required: true,
              })}
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    );
  }
);
