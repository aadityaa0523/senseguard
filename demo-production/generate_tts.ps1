Add-Type -AssemblyName System.Speech

$outDir = "C:\Users\Aadityaa\AppData\Local\Temp\claude\C--Users-Aadityaa-iqoo\21248634-6eaf-43eb-92e8-d4243041b54d\scratchpad\shots\audio"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$lines = [ordered]@{
  "00" = "SenseGuard turns any phone into a medication safety sensor -- sensing, verifying, and guiding a single dose, end to end."
  "01" = "A context switch adapts the flow: pharmacy mode for verification before purchase, home mode for adherence, and clinic mode for a clinician hand-off."
  "02" = "A live capability check shows exactly which sensors are real on this device right now. Camera, motion, orientation, GPS, and haptics are wired up. Barometer isn't exposed in a browser -- an honest gap the native Android build will close."
  "10a" = "Pick up the medicine, point the camera, and SenseGuard watches motion data until the frame is steady enough to trust."
  "10b" = "Once it's steady, the frame locks automatically -- no button required."
  "10c" = "SenseGuard confirms what it's looking at."
  "10d" = "Then it fuses six signals -- identity, packaging, barcode, expiry, prescription, and live location confidence -- into one explainable verdict."
  "10e" = "Metformin, five hundred milligrams, is due now -- spoken, shown on screen, and confirmed with a haptic buzz."
  "10f" = "Every dose is logged on-device, and a caregiver view flags anything missed."
  "20a" = "Scan a different medicine, and the same engine catches what's wrong."
  "20b" = "A packaging mismatch stops the user cold: don't rely on the visual check alone."
  "20c" = "That event feeds a community safety signal -- a local count today, an anonymized regional pattern in production."
  "end" = "SenseGuard. Built for the iQOO Hackathon, twenty twenty-six. The phone isn't running SenseGuard -- the phone is SenseGuard."
}

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft David Desktop")
$synth.Rate = 1

foreach ($key in $lines.Keys) {
  $path = Join-Path $outDir "line_$key.wav"
  $synth.SetOutputToWaveFile($path)
  $synth.Speak($lines[$key])
  $synth.SetOutputToDefaultAudioDevice()
  Write-Output "wrote $path"
}
