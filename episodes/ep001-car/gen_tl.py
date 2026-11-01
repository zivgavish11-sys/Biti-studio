import json,subprocess,re
PH=["שלום,","אני ביטי,","והיום אני אלמד אתכם איך מכונית בלי נהג רואה את הכביש.",
"יש לה שלושה סוגים של עיניים,","וכל אחת רואה משהו אחר.",
"הראשונה:","מצלמות.","הן רואות צבעים,","קוראות תמרורים ומזהות רמזור אדום.","אבל בחושך ובערפל,","הן מתקשות.",
"השנייה:","מכ\"ם.","הוא שולח גלי רדיו,","ומודד כמה רחוקה כל מכונית ובאיזו מהירות היא נוסעת.","גם בגשם.","אבל התמונה שלו מטושטשת.",
"השלישית:","לייזר.","הוא יורה קרני אור לכל הכיוונים,","ובונה מפה תלת ממדית מדויקת של כל מה שמסביב.",
"ואז המחשב מחבר את שלושתן לתמונה אחת,","ומחליט:","לבלום,","לפנות או להמשיך.","והכול בפחות משנייה.",
"ועובדה מעניינת:","טסלה בחרה לסמוך כמעט רק על מצלמות,","כמו עיניים של בן אדם.","ויש על זה ויכוח גדול בעולם.",
"תעקבו אחריי לעוד תוכן וחדשות על רובוטים."]
out=subprocess.run(["ffmpeg","-i","voice.mp3","-af","silencedetect=noise=-35dB:d=0.16","-f","null","-"],capture_output=True,text=True).stderr
ss=[float(x) for x in re.findall(r"silence_start: ([\d.]+)",out)]; se=[float(x) for x in re.findall(r"silence_end: ([\d.]+)",out)]
segs=[];cur=0.0
for a,b in zip(ss,se):
    if a-cur>0.05: segs.append([cur,a])
    cur=b
dur=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0","voice.mp3"],capture_output=True,text=True).stdout)
if dur-cur>0.1: segs.append([cur,dur])
print(len(segs),len(PH))
assert len(segs)==len(PH),segs
chunks=[];words=[]
for i,(p,(a,b)) in enumerate(zip(PH,segs)):
    ws=p.split(); L=sum(len(w)+2 for w in ws); t=a; sw=[]
    for w in ws:
        d=(b-a)*(len(w)+2)/L; sw.append({"w":w,"a":round(t,3),"b":round(t+d,3)}); t+=d
    groups=[sw] if len(sw)<=4 else [sw[k:k+3] for k in range(0,len(sw),3)]
    if len(groups)>1 and len(groups[-1])==1: groups[-2]+=groups.pop()
    for g in groups: chunks.append({"a":g[0]["a"],"b":g[-1]["b"],"words":g,"seg":i})
for i,c in enumerate(chunks):
    nb=chunks[i+1]["a"] if i+1<len(chunks) else c["b"]+1.2
    c["b"]=round(min(nb,c["b"]+0.6),3)
A=[s[0] for s in segs]; B=[s[1] for s in segs]
end=round(dur+1.0,2)
S=[0,A[3]-0.25,A[5]-0.25,A[11]-0.25,A[17]-0.25,A[21]-0.25,A[26]-0.25,A[30]-0.25,end]
json.dump({"segA":A,"segB":B,"s":S,"chunks":chunks,"end":end},open("timeline.json","w"),ensure_ascii=False)
print("S",[round(x,2) for x in S]); print([ (i,round(a,2),round(b,2)) for i,(a,b) in enumerate(segs)])
