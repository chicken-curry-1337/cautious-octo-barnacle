import { makeAutoObservable, reaction } from "mobx";

export enum UserAbility {
    Strength = "strength",
    Dexterity = "dexterity",
    Constitution = "constitution",
    Intelligence = "intelligence",
    Wisdom = "wisdom",
    Charisma = "charisma",
}

export type IUserAbilities = Record<UserAbility, number>;

export type TMoneyBalance = number;

export type TUser = {
    userAbilities: IUserAbilities;
    playerName: TPlayerName;
}

export type TPlayerName = {
    name: string;
    surname: string;
}

const STARTING_MONEY: TMoneyBalance = 1000;

const DEFAULT_USER: IUserAbilities = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
}

const DEFAULT_PLAYER_NAME: TPlayerName = {
    name: 'John',
    surname: 'Doe'
}

export class UserStore {
    userAbilities: IUserAbilities = DEFAULT_USER;
    moneyBalance = STARTING_MONEY;
    playerName: TPlayerName = DEFAULT_PLAYER_NAME;

    constructor() {
        makeAutoObservable(this);

        reaction(() => this.user, (user) => {
            console.log(user);
        });
    }


    createUser = ({userAbilities, playerName}: TUser) => {
        this.userAbilities = {...userAbilities};
        this.playerName = {...playerName};
    }

    changeUserAbilities =(userAbilities: Partial<IUserAbilities>) => {
        this.userAbilities = {
            ...this.userAbilities,
            ...userAbilities,
        }
    }

    changeUserName = (playerName: Partial<TPlayerName>) => {
        this.playerName = {
            ...this.playerName,
            ...playerName
        }
    }

    get user() {
        return {
            userAbilities: this.userAbilities,
            playerName: this.playerName
        }
    }

    get defaultUser() {
        return {
            userAbilities: DEFAULT_USER,
            playerName: DEFAULT_PLAYER_NAME
        }
    }
}