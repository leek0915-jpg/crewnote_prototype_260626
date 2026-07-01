// ===========================================
// 팀 로직 (생성 / 참여 / 조회)
// ===========================================

import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { getFirebaseDb } from '@/lib/firebase/client';

export interface TeamDoc {
  id: string;
  name: string;
  leaderId: string;
  joinCode: string;
  memberIds: string[];
}

// 헷갈리는 문자(0,O,1,I 등) 제외한 참여 코드
function genJoinCode(len = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/** 팀 생성 → 생성자는 팀장이 된다 */
export async function createTeam(user: User, teamName: string): Promise<{ teamId: string; joinCode: string }> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore 초기화 실패');
  const name = teamName.trim();
  if (!name) throw new Error('팀 이름을 입력해주세요.');

  const teamRef = doc(collection(db, 'teams'));
  const joinCode = genJoinCode();
  await setDoc(teamRef, {
    id: teamRef.id,
    name,
    leaderId: user.uid,
    joinCode,
    memberIds: [user.uid],
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', user.uid), {
    role: 'leader',
    teamId: teamRef.id,
    updatedAt: serverTimestamp(),
  });
  return { teamId: teamRef.id, joinCode };
}

/** 참여 코드로 팀 참여 → 팀원이 된다 */
export async function joinTeam(user: User, code: string): Promise<{ teamId: string; name: string }> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore 초기화 실패');
  const joinCode = code.trim().toUpperCase();
  if (!joinCode) throw new Error('참여 코드를 입력해주세요.');

  const snap = await getDocs(query(collection(db, 'teams'), where('joinCode', '==', joinCode)));
  if (snap.empty) throw new Error('그런 참여 코드를 가진 팀이 없어요. 코드를 다시 확인해주세요.');

  const teamDoc = snap.docs[0];
  await updateDoc(teamDoc.ref, { memberIds: arrayUnion(user.uid) });
  await updateDoc(doc(db, 'users', user.uid), {
    role: 'member',
    teamId: teamDoc.id,
    updatedAt: serverTimestamp(),
  });
  return { teamId: teamDoc.id, name: teamDoc.data().name };
}

export interface TeamMember {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'leader' | 'member' | null;
  sparkTotal: number;
  currentStreak: number;
}

/** 팀 멤버 목록 (users where teamId == teamId) */
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const snap = await getDocs(query(collection(db, 'users'), where('teamId', '==', teamId)));
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      uid: d.id,
      displayName: x.displayName || '이름없음',
      email: x.email || '',
      photoURL: x.photoURL || '',
      role: x.role ?? null,
      sparkTotal: x.sparkTotal || 0,
      currentStreak: x.currentStreak || 0,
    };
  });
}

export interface MemberNote {
  id: string;
  userId: string;
  summary: string;
  mainTasks: string[];
  sparkAwarded: number;
  createdAt: string;
}

/** 팀의 최근 노트들 (teamId 기준, 메모리 정렬) */
export async function getTeamNotes(teamId: string, max = 100): Promise<MemberNote[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  // 인덱스 없이 동작하도록 where만 사용하고 메모리에서 정렬
  const snap = await getDocs(query(collection(db, 'notes'), where('teamId', '==', teamId)));
  const list = snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      userId: x.userId,
      summary: x.summary || '',
      mainTasks: x.mainTasks || [],
      sparkAwarded: x.sparkAwarded || 0,
      createdAt: x.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
    };
  });
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list.slice(0, max);
}
