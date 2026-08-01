import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const sitesWorker=`const spaFallback=(request,env)=>{
  const url=new URL(request.url);
  url.pathname="/index.html";
  return env.ASSETS.fetch(new Request(url,request));
};

export default {
  async fetch(request,env){
    if(!env?.ASSETS?.fetch){
      return new Response("Jardin Soleil assets are unavailable.",{status:503});
    }
    const response=await env.ASSETS.fetch(request);
    if(response.status!==404)return response;
    const acceptsHtml=request.headers.get("accept")?.includes("text/html");
    return request.method==="GET"&&acceptsHtml?spaFallback(request,env):response;
  },
};
`;

export default defineConfig({
  plugins:[
    react(),
    {
      name:"jardin-soleil-sites-worker",
      generateBundle(){
        this.emitFile({type:"asset",fileName:"server/index.js",source:sitesWorker});
      },
    },
  ],
});
