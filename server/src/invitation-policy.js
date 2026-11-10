export function canRespond(invite,receiverId,next){
 if(!invite||String(invite.receiver)!==String(receiverId))return {error:"Invitation unavailable.",status:403};
 if(!["accepted","declined"].includes(next))return {error:"Invalid invitation status.",status:400};
 if(invite.status!=="pending")return {error:"This invitation has already been answered.",status:409};
 return {ok:true};
}
export function canInvite(project,ownerId,receiverId){
 if(!project||String(project.owner)!==String(ownerId))return {error:"Only project owners may invite.",status:403};
 if(project.status!=="open")return {error:"This project is closed.",status:409};
 if(String(ownerId)===String(receiverId))return {error:"You cannot invite yourself.",status:400};
 if(!project.shortlist.some(id=>String(id)===String(receiverId)))return {error:"Shortlist the creator first.",status:403};
 return {ok:true};
}
export function canRemoveShortlist(project,ownerId,candidateId){
 if(!project||String(project.owner)!==String(ownerId))return {error:"Only the project owner may manage shortlist.",status:403};
 if(!project.shortlist.some(id=>String(id)===String(candidateId)))return {error:"Creator is not shortlisted.",status:404};
 return {ok:true};
}
