// Small shim to rewrite relative '../php/' fetch requests to use API_BASE when present.
(function(){
  try {
    const orig = window.fetch.bind(window);
    window.fetch = function(input, init){
      try {
        if (typeof input === 'string'){
          // If request points to the local php folder via relative path, rewrite
          if (input.indexOf('../php/') === 0){
            const prefix = (typeof API_BASE !== 'undefined') ? API_BASE : '../php/';
            input = prefix + input.slice('../php/'.length);
          }
          // Also rewrite absolute localhost php paths
          if (input.indexOf('http://localhost/proyectoJardin/php/') === 0 || input.indexOf('https://localhost/proyectoJardin/php/') === 0){
            const prefix = (typeof API_BASE !== 'undefined') ? API_BASE : input.substring(0, input.indexOf('/php/')+1);
            const tail = input.substring(input.indexOf('/php/')+5);
            input = prefix + tail;
          }
        }
      } catch(e){ /* ignore */ }
      return orig(input, init);
    };
    console.info('fetch-rewrite: active');
  } catch(e){ console.warn('fetch-rewrite: failed to install shim', e); }
})();
