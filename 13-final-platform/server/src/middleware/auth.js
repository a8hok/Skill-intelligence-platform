import jwt from 'jsonwebtoken';
export function auth(req,res,next){
  const token=req.headers.authorization?.replace('Bearer ','');
  if(!token)return res.status(401).json({message:'Authentication required'});
  try{req.user=jwt.verify(token,process.env.JWT_SECRET || 'dev-secret');next()}catch{return res.status(401).json({message:'Session expired. Please sign in again.'})}
}
