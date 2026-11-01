import numpy as np, wave
SR=44100; DUR=54.5; N=int(SR*DUR); t=np.arange(N)/SR
BPM=88; beat=60/BPM; bar=beat*4
def mid(n): return 440*2**((n-69)/12)
chords=[[57,60,64,67],[53,57,60,64],[48,55,59,64],[55,59,62,64]]  # Am7 Fmaj7 Cmaj7 G6
out=np.zeros(N)
# lowpass helper (one-pole)
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0.0
    for i in range(0,len(x),1): s=(1-a)*x[i]+a*s; y[i]=s
    return y
from scipy.signal import butter, lfilter
def lpf(x,fc,o=2): b,a=butter(o,fc/(SR/2)); return lfilter(b,a,x)
def hpf(x,fc,o=2): b,a=butter(o,fc/(SR/2),'high'); return lfilter(b,a,x)
# pad
pad=np.zeros(N); cl=bar*2
nchord=int(DUR/cl)+1
for k in range(nchord):
    s0=int(k*cl*SR); s1=min(N,int((k+1)*cl*SR)+int(0.6*SR)); tt=np.arange(s1-s0)/SR
    env=np.minimum(1,tt/1.2)*np.minimum(1,np.maximum(0,(cl+0.6-tt)/0.9))
    for n in chords[k%4]:
        for det in(-0.08,0.08):
            f=mid(n-12)*2**(det/12); ph=(f*tt)%1; pad[s0:s1]+=(2*ph-1)*env*0.05
pad=lpf(pad,900,2)
# bass
bass=np.zeros(N)
for k in range(nchord*2):
    s0=int(k*bar*SR); s1=min(N,int((k+1)*bar*SR)); tt=np.arange(s1-s0)/SR
    root=chords[(k//2)%4][0]-24; f=mid(root)
    env=np.exp(-tt*1.2)*np.minimum(1,tt/0.02)
    bass[s0:s1]+=np.sin(2*np.pi*f*tt)*env*0.28
# arp pluck (eighth notes)
arp=np.zeros(N); step=beat/2; rng=np.random.default_rng(1)
for k in range(int(DUR/step)):
    s0=int(k*step*SR); if_s1=min(N,s0+int(1.2*SR)); tt=np.arange(if_s1-s0)/SR
    ch=chords[int(k*step/cl)%4]; pat=[0,2,1,3,2,1,3,2]; n=ch[pat[k%8]]+12
    f=mid(n); env=np.exp(-tt*5.5)*np.minimum(1,tt/0.004)
    v=(np.sin(2*np.pi*f*tt)+0.3*np.sin(4*np.pi*f*tt)*np.exp(-tt*8))*env*(0.07 if k%2==0 else 0.05)
    arp[s0:if_s1]+=v
arp=lpf(arp,3500)
# drums
dr=np.zeros(N)
for k in range(int(DUR/beat)):
    s0=int(k*beat*SR)
    if k%4 in(0,2):  # soft kick
        L=int(0.35*SR); tt=np.arange(min(L,N-s0))/SR; f=55+70*np.exp(-tt*30)
        dr[s0:s0+len(tt)]+=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*9)*0.45
    if k%4 in(1,3):  # soft snap/rim
        L=int(0.12*SR); tt=np.arange(min(L,N-s0))/SR; nz=rng.standard_normal(len(tt))
        dr[s0:s0+len(tt)]+=hpf(nz,1800)*np.exp(-tt*35)*0.12
    for h in (0,0.5):  # hats
        s=s0+int(h*beat*SR); L=int(0.05*SR); tt=np.arange(min(L,max(0,N-s)))/SR
        if len(tt): dr[s:s+len(tt)]+=hpf(rng.standard_normal(len(tt)),7000)*np.exp(-tt*80)*(0.05 if h else 0.035)
mix=pad*1.0+bass+arp+dr*0.8
# gentle tape wobble/stereo
L=mix; R=np.roll(mix,int(0.012*SR))*0.95+mix*0.05
fade=np.minimum(1,t/1.5)*np.minimum(1,(DUR-t)/2.5)
st=np.stack([L*fade,R*fade],1); st/=np.max(np.abs(st))*1.12
wf=wave.open("music.wav","wb"); wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((st*32767).astype(np.int16).tobytes()); wf.close()
print("ok")
