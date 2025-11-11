export const extractFileId = (msg: any) => {
  switch (true) {

    case !!msg.text:
      return {
        textWork: msg.text
      };

    case !!msg.document:
      return {
        fileId: msg.document.file_id,
      };

    case !!msg.photo:
      const photo = msg.photo[msg.photo.length - 1];
      return {
        fileId: photo.file_id,
      };

    case !!msg.video:
      return {
        fileId: msg.video.file_id,
      };

    case !!msg.audio:
      return {
        fileId: msg.audio.file_id,
      };

    case !!msg.voice:
      return {
        fileId: msg.voice.file_id,
      };

    default:
      break;
  }
}

export const getDelay = (date: Date) => {
  return date.getTime() - Date.now() + 60 * 60 * 1000
}