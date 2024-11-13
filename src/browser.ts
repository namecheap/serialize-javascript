import { Serializer } from './Serializer';
import { generateUUID } from './generateUUID';

const uuid = generateUUID(window.crypto);
const serializer = new Serializer(uuid);

const serialize = serializer.serialize.bind(serializer);

export { serialize };
export default serialize;
