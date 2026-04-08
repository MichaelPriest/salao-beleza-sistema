// Compatibilidade com o Timestamp do Firestore usando datas ISO para Supabase
export class Timestamp {
  constructor(date) {
    this._date = date instanceof Date ? date : new Date(date);
    this.seconds = Math.floor(this._date.getTime() / 1000);
    this.nanoseconds = (this._date.getTime() % 1000) * 1_000_000;
  }

  toDate() {
    return new Date(this._date);
  }

  toMillis() {
    return this._date.getTime();
  }

  toJSON() {
    return this._date.toISOString();
  }

  static now() {
    return new Timestamp(new Date());
  }

  static fromDate(date) {
    return new Timestamp(date);
  }
}

export default Timestamp;
