export function suffixer(locale) {
  const capitalized = locale.charAt(0).toUpperCase() + locale.slice(1).toLowerCase();
  return strings => strings[0].replace(/(Fi|Sv|En)(?=[\.A-Z]|$)/g, capitalized);
}

export const decisionMakerLabels = {
  LT:  $localize`Luonnontieteiden ja tekniikan tutkimuksen toimikunta`,
  BTY: $localize`Biotieteiden, terveyden ja ympäristön tutkimuksen toimikunta`,
  KY:  $localize`Kulttuurin ja yhteiskunnan tutkimuksen toimikunta`,
  TIK: $localize`Tutkimusinfrastruktuurikomitea`,
  STN: $localize`Strategisen tutkimuksen neuvosto`
} as const;
