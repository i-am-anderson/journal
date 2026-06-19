import {
  Account,
  AppConfigs,
  DailyProcess,
  Setup,
  Strategy,
  Trade,
} from "../types";
import {
  DEFAULT_STRATEGIES,
  DEFAULT_SETUPS,
  DEFAULT_ACCOUNTS,
  DEFAULT_CONFIGS,
  DEFAULT_GOALS,
} from "../helpers/constants";

// Chaves que serão usadas no LocalStorage
const KEYS = {
  TRADES: "journal_trades",
  SETUPS: "journal_setups",
  STRATEGIES: "journal_strategies",
  ACCOUNTS: "journal_accounts",
  CONFIGS: "journal_configs",
  DAILY_PROCESS: "journal_daily_process",
  PROCESS_GOALS: "journal_process_goals",
};

// Funções utilitárias internas para o LocalStorage
const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocal = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

/* ══════════════════════════════════════════════════════════════════════
  STORAGE SERVICE (API-READY)
══════════════════════════════════════════════════════════════════════ */
export const storageService = {
  // CONFIGS
  getConfigs: async (): Promise<AppConfigs> =>
    getLocal(KEYS.CONFIGS, DEFAULT_CONFIGS),
  saveConfigs: async (configs: AppConfigs): Promise<AppConfigs> => {
    setLocal(KEYS.CONFIGS, configs);
    return configs;
  },

  // ACCOUNTS
  getAccounts: async (): Promise<Account[]> =>
    getLocal(KEYS.ACCOUNTS, DEFAULT_ACCOUNTS),
  saveAccounts: async (accounts: Account[]): Promise<Account[]> => {
    setLocal(KEYS.ACCOUNTS, accounts);
    return accounts;
  },

  // SETUPS
  getSetups: async (): Promise<Setup[]> =>
    getLocal(KEYS.SETUPS, DEFAULT_SETUPS),
  saveSetups: async (setups: Setup[]): Promise<Setup[]> => {
    setLocal(KEYS.SETUPS, setups);
    return setups;
  },

  // STRATEGIES
  getStrategies: async (): Promise<Strategy[]> =>
    getLocal(KEYS.STRATEGIES, DEFAULT_STRATEGIES),
  saveStrategies: async (strategies: Strategy[]): Promise<Strategy[]> => {
    setLocal(KEYS.STRATEGIES, strategies);
    return strategies;
  },

  // TRADES
  getTrades: async (): Promise<Trade[]> => getLocal(KEYS.TRADES, []),
  saveTrades: async (trades: Trade[]): Promise<Trade[]> => {
    setLocal(KEYS.TRADES, trades);
    return trades;
  },

  // DAILY PROCESS
  getDailyProcess: async (): Promise<DailyProcess[]> =>
    getLocal(KEYS.DAILY_PROCESS, []),
  saveDailyProcess: async (
    dailyProcess: DailyProcess[],
  ): Promise<DailyProcess[]> => {
    setLocal(KEYS.DAILY_PROCESS, dailyProcess);
    return dailyProcess;
  },

  // PROCESS GOALS
  getProcessGoals: async (): Promise<string[]> =>
    getLocal(KEYS.PROCESS_GOALS, DEFAULT_GOALS),
  saveProcessGoals: async (dailyProcess: string[]): Promise<string[]> => {
    setLocal(KEYS.PROCESS_GOALS, dailyProcess);
    return dailyProcess;
  },
};
