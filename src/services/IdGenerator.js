export default class IdGenerator {
  newId(prefix = 'n_') {
    return prefix + Math.random().toString(36).slice(2);
  }
}
