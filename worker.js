// Cloudflare Worker: deploy with wrangler and set OPENAI_API_KEY as a secret.
// Set ALLOWED_ORIGIN to your exact GitHub Pages origin.
const cors=(origin,allowed)=>({'Access-Control-Allow-Origin':allowed,'Vary':'Origin','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Cache-Control':'no-store'});
export default {async fetch(request,env){
 const allowed=env.ALLOWED_ORIGIN||'https://keubanks16.github.io',origin=request.headers.get('Origin')||'';
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin,allowed)});
 if(request.method!=='POST'||new URL(request.url).pathname!=='/generate')return new Response('Not found',{status:404});
 if(origin!==allowed)return new Response('Origin not allowed',{status:403});
 const headers={...cors(origin,allowed),'Content-Type':'application/json'};
 if(!env.OPENAI_API_KEY||!env.APP_ACCESS_TOKEN)return Response.json({error:'Worker secrets are not configured'},{status:503,headers});
 if(request.headers.get('Authorization')!=='Bearer '+env.APP_ACCESS_TOKEN)return Response.json({error:'Incorrect app access code'},{status:401,headers});
 if(Number(request.headers.get('Content-Length')||0)>120000)return Response.json({error:'Request too large'},{status:413,headers});
 let data;try{data=await request.json()}catch{return Response.json({error:'Invalid JSON'},{status:400,headers})}
 const description=String(data.description||'').slice(0,1600).trim(),revision=String(data.revision||'').slice(0,800),style=String(data.style||'').slice(0,80);
 if(!description)return Response.json({error:'Describe your flyer'},{status:400,headers});
 const prompt='Create a premium, highly polished, professional sports promotional flyer BACKGROUND ARTWORK ONLY, in vertical portrait format. No text, no letters, no words, no numbers, no logos, no watermarks, no QR codes. Leave intentional clean negative space for editable typography across top, center and bottom. Use authentic high-impact sports marketing art direction: photorealistic night stadium lighting, dramatic depth, textured paint and torn-paper brush strokes, dynamic compositional diagonals, realistic baseball details, sophisticated contrast, layered lighting and cinematic atmosphere. Avoid cheap vector streaks and flat clipart. Color scheme and creative brief: '+description+'. Art direction: '+style+'. Requested change: '+revision+'. The final image must feel like an agency-designed athletic campaign poster, NOT a template.';
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),115000);
 try{
  const response=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',signal:controller.signal,headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:env.IMAGE_MODEL||'gpt-image-1.5',prompt,size:'1024x1536',quality:'high',n:1})});
  const body=await response.json().catch(()=>({}));if(!response.ok)return Response.json({error:body.error?.message||'OpenAI image request failed'},{status:response.status,headers});
  const b64=body.data?.[0]?.b64_json;if(!b64)return Response.json({error:'No image was returned'},{status:502,headers});
  return Response.json({image:'data:image/png;base64,'+b64},{headers});
 }catch(e){return Response.json({error:e.name==='AbortError'?'Generation timed out':String(e.message||e)},{status:502,headers})}finally{clearTimeout(timer)}
}};