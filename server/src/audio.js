export const AUDIO_MAX_BYTES=2*1024*1024;
export const AUDIO_MAX_FILES=5;
export function validateAudioFile(buffer,declaredType){
 if(!Buffer.isBuffer(buffer)||buffer.length<44||buffer.length>AUDIO_MAX_BYTES)return {error:"Audio must be between 44 bytes and 2 MB."};
 if(!["audio/mpeg","audio/mp3","audio/wav","audio/x-wav","audio/wave"].includes(declaredType))return {error:"Only MP3 and WAV uploads are accepted."};
 const riff=buffer.toString("ascii",0,4)==="RIFF"&&buffer.toString("ascii",8,12)==="WAVE";
 const mp3=buffer.toString("ascii",0,3)==="ID3"||buffer[0]===255&&(buffer[1]&0xe0)===0xe0&&((buffer[1]>>1)&3)!==0;
 if(riff&&declaredType.startsWith("audio/w"))return {mimeType:"audio/wav",extension:"wav"};
 if(mp3&&["audio/mpeg","audio/mp3"].includes(declaredType))return {mimeType:"audio/mpeg",extension:"mp3"};
 return {error:"The file content does not match a valid MP3 or WAV header."};
}
export function validateAudioMetadata(title,kind){
 if(typeof title!=="string"||title.trim().length<2||title.trim().length>100)return {error:"Audio title must contain 2 to 100 characters."};
 if(!["music","vocal"].includes(kind))return {error:"Select music or vocal sample."};
 return {title:title.trim(),kind};
}
