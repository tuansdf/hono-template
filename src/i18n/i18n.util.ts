import i18nGlobal, { i18n as i18nType } from "i18next";
import Backend from "i18next-fs-backend";
import { defaultLang, validLangs } from "~/i18n/i18n.constant";
import { TFn, ValidLang } from "~/i18n/i18n.type";

const KEY_SEPARATED_BY = ";";

class I18nUtils {
  public getLang(lang?: string): ValidLang {
    let result: ValidLang = defaultLang;
    if (validLangs.includes(lang as ValidLang)) {
      result = lang as ValidLang;
    }
    return result;
  }

  public getMessage(t: TFn, key: string) {
    return t(key);
  }

  public getMessageAndParams(t: TFn, input: string): string {
    const split = input.split(KEY_SEPARATED_BY);
    const mainKey = split[0] || "";
    const params: Record<number, string> = {};
    for (let i = 1; i < split.length; i++) {
      params[i] = t(split[i]!);
    }
    return t(mainKey, params);
  }
}

export const i18nUtils = new I18nUtils();

class I18n {
  private _instance!: i18nType;

  public async init() {
    const temp = i18nGlobal.createInstance();
    await temp.use(Backend).init({
      fallbackLng: defaultLang,
      preload: validLangs,
      ns: ["translation"],
      defaultNS: "translation",
      backend: {
        loadPath: "./resources/locales/{{lng}}/{{ns}}.json",
      },
    });
    this._instance = temp;
  }

  public getT(lang?: string) {
    return this._instance.getFixedT(i18nUtils.getLang(lang));
  }
}

export const i18n = new I18n();
