// login.html - era inline nella pagina; file a parte dal 29/09/2026 (CSP senza 'unsafe-inline').
const say = (t, k = 'info') => $('#msg').innerHTML = `<div class="msg ${k}">${t}</div>`;

// Chi ha gia' una sessione valida non deve rivedere il form.
(async () => {
  if (await sessione()) location.replace('account.html');
})();

$('#f').addEventListener('submit', async e => {
  e.preventDefault();
  const email = $('#email').value.trim();
  $('#go').disabled = true;
  say('Invio in corso…');
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: pagina('account.html') }
  });
  if (error) {
    // Rate limit del tier gratuito Supabase: ~30 email/ora. Va detto, non nascosto.
    say(`Non ha funzionato: ${error.message}`, 'err');
    $('#go').disabled = false;
    return;
  }
  say(`Fatto. Controlla <b>${email}</b> e apri il link per entrare.<br>
       Se non arriva entro qualche minuto, guarda nello spam.`, 'ok');
});
