const { input, select, option } = require("saltcorn-markup/tags");

const isdef = x => (typeof x === "undefined" ? false : true);

const getStrOptions = (v, optsStr) =>
  optsStr
    .split(",")
    .map(s => s.trim())
    .map(o => option({ value: o, ...(v === o && { selected: true }) }, o));

const string = {
  name: "String",
  sql_name: "text",
  attributes: [
    { name: "match", type: "String", required: false },
    { name: "options", type: "String", required: false }
  ],
  editAs: (nm, v, attrs, cls) =>
    attrs.options
      ? select(
          { class: `form-control ${cls || ""}`, name: nm, id: `input${nm}` },
          getStrOptions(v, attrs.options)
        )
      : input({
          type: "text",
          class: `form-control ${cls || ""}`,
          name: nm,
          id: `input${nm}`,
          ...(isdef(v) && { value: v })
        }),
  read: v => {
    switch (typeof v) {
      case "string":
        return v;
      default:
        return undefined;
    }
  },
  validate: ({ match }) => x => true
};

const int = {
  name: "Integer",
  sql_name: "text",
  editAs: (nm, v, attrs, cls) =>
    input({
      type: "number",
      class: `form-control ${cls || ""}`,
      name: nm,
      id: `input${nm}`,
      ...(attrs.max && { max: attrs.max }),
      ...(attrs.min && { min: attrs.min }),
      ...(isdef(v) && { value: v })
    }),
  attributes: [
    { name: "max", type: "Integer", required: false },
    { name: "min", type: "Integer", required: false }
  ],
  read: v => {
    switch (typeof v) {
      case "number":
        return v;
      case "string":
        const parsed = parseInt(v);
        return isNaN(parsed) ? undefined : parsed;
      default:
        return undefined;
    }
  },
  validate: ({ min, max }) => x => {
    if (isdef(min) && x < min) return { error: `Must be ${min} or higher` };
    if (isdef(max) && x > max) return { error: `Must be ${max} or less` };
    return true;
  }
};

const bool = {
  name: "Bool",
  sql_name: "boolean",
  editAs: (nm, v, attrs, cls) =>
    `<input class="form-check-input ${cls ||
      ""}" type="checkbox" name="${nm}" id="input${nm}" ${v ? `checked` : ""}>`,
  attributes: [],
  readFromFormRecord: (rec, name) => {
    if (!rec[name]) return false;
    if (rec[name] === "undefined" || rec[name] === "false") return false;
    return rec[name] ? true : false;
  },
  read: v => {
    switch (typeof v) {
      case "string":
        if (v.toUpperCase === "TRUE" || v.toUpperCase === "T") return true;
        else return false;
      default:
        return v ? true : false;
    }
  },
  showAs: v => (v === true ? "True" : v === false ? "False" : ""),
  validate: () => x => true
};

module.exports = { string, int, bool };