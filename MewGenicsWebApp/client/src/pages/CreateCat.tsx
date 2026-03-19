export default function CreateCat() {
  return (
    <div>
      <h1>Nuevo Gato</h1>

      <form>
        <input placeholder="Nombre" />

        <select>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="unknown">Unknown</option>
        </select>

        <button type="submit">Crear</button>
      </form>
    </div>
  );
}