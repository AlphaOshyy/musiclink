/** Map FFT bins into a compact perceptual spectrum for small screens. */
export function bandLevels(fft,columns=48){
 if(!fft||fft.length===0||columns<1)return [];
 const output=new Array(columns);
 // Logarithmic weighting gives more space to low frequencies.
 for(let i=0;i<columns;i++){
  const low=Math.floor((Math.exp(Math.log(fft.length+1)*i/columns)-1));
  const high=Math.max(low+1,Math.ceil(Math.exp(Math.log(fft.length+1)*(i+1)/columns)-1));
  let sum=0,count=0;
  for(let k=low;k<Math.min(fft.length,high);k++){sum+=fft[k];count++;}
  output[i]=Math.min(1,Math.max(0,(count?sum/count:0)/255));
 }
 return output;
}
