import type { Ref } from "vue";

export type AppType = "LOCAL_FILE" | "RESTAPI" | "POST_MESSAGE";

export interface ProviderAppConfig extends Array<any> {
  0: Ref<IAppConfig>;
  1: (data: IAppConfig) => void;
}

export interface IAppConfig {
  autoExpandFail: boolean;
}

export interface AppForm {
  appType: AppType;
  url: string;
  file: string;
  title: string;
}

export interface ProviderAppForm extends Array<any> {
  0: Ref<AppForm>;
  1: (data: AppForm) => void;
}

export interface StatisticsItem {
  dir: string;
  script: string;
  total: number;
  pass: number;
  fail: number;
  elapsedTimeArr: number[];
  domId: string;
  result: Result;
  children?: StatisticsItem[];
}


export type LogData = Dir | Script;

export interface ProviderLogData extends Array<any> {
  0: Ref<LogData | null>;
  1: (data: LogData) => void;
}

export interface Dir {
  dir: string;
  scripts: Script[];
}

export type Result = "PASS" | "FAIL" | "ERROR" | "NOT TEST" | "UNFINISHED";

interface Title extends Array<string> {
  0: string;
  1: string;
  2: string;
}

export interface Script {
  Title: Title;
  Topo_name: string;
  elapsed_time: string;
  Result: Result;
  steps: Step[];
  path: string;
  _baseFilePath: string;
  start_time: string;
  scripts?: any 
}

export interface Step {
  desc: string;
  result: Result;
  stepLists: StepListItem[];
}

export interface StepListItem {
  desc: string;
  result: Result;
}
