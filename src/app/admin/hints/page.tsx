"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: string;
}

interface Hint {
  id?: number;
  problem_id: number;
  tier: string;
  stage: number;
  title: string;
  content: string;
  wait_seconds: number;
}

export default function AdminHints() {
  const searchParams = useSearchParams();
  const initialProblemId = searchParams.get("problemId");

  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    initialProblemId || ""
  );
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingHint, setEditingHint] = useState<Hint | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (selectedProblemId) {
      fetchHints(selectedProblemId);
    }
  }, [selectedProblemId]);

  const fetchProblems = async () => {
    try {
      const response = await fetch('/api/admin/problems');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setProblems(data || []);
    } catch (error) {
      console.error("문제 목록 조회 실패:", error);
      toast.error("문제 목록을 불러오는데 실패했습니다");
    }
  };

  const fetchHints = async (problemId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/hints?problemId=${problemId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setHints(data || []);
      toast.success(`${data?.length || 0}개의 힌트를 불러왔습니다`);
    } catch (error) {
      console.error("힌트 조회 실패:", error);
      setHints([]);
      toast.error("힌트를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHint = () => {
    const selectedProblem = problems.find(
      (p) => p.id.toString() === selectedProblemId
    );
    if (!selectedProblem) return;

    const maxStage = hints.length > 0 ? Math.max(...hints.map((h) => h.stage)) : 0;

    setEditingHint({
      problem_id: parseInt(selectedProblemId),
      tier: selectedProblem.difficulty,
      stage: maxStage + 1,
      title: "",
      content: "",
      wait_seconds: 60,
    });
    setIsCreating(true);
  };

  const handleSaveHint = async () => {
    if (!editingHint) return;

    if (!editingHint.title.trim() || !editingHint.content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요");
      return;
    }

    try {
      if (editingHint.id) {
        // 수정
        const { error } = await supabase
          .from('problem_hints')
          .update({
            tier: editingHint.tier,
            stage: editingHint.stage,
            title: editingHint.title,
            content: editingHint.content,
            wait_seconds: editingHint.wait_seconds,
          })
          .eq('id', editingHint.id);

        if (error) throw error;
        toast.success("힌트가 수정되었습니다");
      } else {
        // 생성
        const { error } = await supabase
          .from('problem_hints')
          .insert([{
            problem_id: editingHint.problem_id,
            tier: editingHint.tier,
            stage: editingHint.stage,
            title: editingHint.title,
            content: editingHint.content,
            wait_seconds: editingHint.wait_seconds,
          }]);

        if (error) throw error;
        toast.success("힌트가 추가되었습니다");
      }

      setEditingHint(null);
      setIsCreating(false);
      fetchHints(selectedProblemId);
    } catch (error) {
      console.error("힌트 저장 실패:", error);
      toast.error("힌트 저장에 실패했습니다");
    }
  };

  const handleDeleteHint = async (hintId: number) => {
    if (!confirm("이 힌트를 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from('problem_hints')
        .delete()
        .eq('id', hintId);

      if (error) throw error;

      toast.success("힌트가 삭제되었습니다");
      fetchHints(selectedProblemId);
    } catch (error) {
      console.error("힌트 삭제 실패:", error);
      toast.error("힌트 삭제에 실패했습니다");
    }
  };

  const selectedProblem = problems.find(
    (p) => p.id.toString() === selectedProblemId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">힌트 관리</h1>
          <p className="text-slate-600">문제별 힌트를 추가하고 관리합니다 (Supabase 직접 연동)</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">← 관리자 콘솔</Link>
        </Button>
      </div>

      {/* 문제 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>문제 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>문제</Label>
              <Select value={selectedProblemId} onValueChange={setSelectedProblemId}>
                <SelectTrigger>
                  <SelectValue placeholder="문제를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {problems.map((problem) => (
                    <SelectItem key={problem.id} value={problem.id.toString()}>
                      [{problem.slug}] {problem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedProblemId && (
              <div className="flex items-end">
                <Button onClick={handleCreateHint} disabled={isCreating}>
                  <Plus className="mr-2 h-4 w-4" />
                  힌트 추가
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 힌트 목록 */}
      {selectedProblemId && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedProblem?.title} - 힌트 목록 ({hints.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-center text-slate-500">로딩 중...</p>
            ) : hints.length === 0 && !isCreating ? (
              <p className="text-center text-slate-500">
                등록된 힌트가 없습니다. 힌트를 추가해보세요.
              </p>
            ) : (
              <>
                {hints.map((hint) => (
                  <Card
                    key={hint.id}
                    className={
                      editingHint?.id === hint.id
                        ? "border-2 border-primary"
                        : ""
                    }
                  >
                    {editingHint?.id === hint.id && editingHint ? (
                      <CardContent className="space-y-4 pt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>단계</Label>
                            <Input
                              type="number"
                              value={editingHint.stage}
                              onChange={(e) =>
                                setEditingHint({
                                  ...editingHint,
                                  stage: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>대기 시간 (초)</Label>
                            <Input
                              type="number"
                              value={editingHint.wait_seconds}
                              onChange={(e) =>
                                setEditingHint({
                                  ...editingHint,
                                  wait_seconds: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label>제목</Label>
                          <Input
                            value={editingHint.title}
                            onChange={(e) =>
                              setEditingHint({
                                ...editingHint,
                                title: e.target.value,
                              })
                            }
                            placeholder="힌트 제목"
                          />
                        </div>
                        <div>
                          <Label>내용</Label>
                          <Textarea
                            value={editingHint.content}
                            onChange={(e) =>
                              setEditingHint({
                                ...editingHint,
                                content: e.target.value,
                              })
                            }
                            placeholder="힌트 내용"
                            rows={5}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingHint(null);
                              setIsCreating(false);
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            취소
                          </Button>
                          <Button onClick={handleSaveHint}>
                            <Save className="mr-2 h-4 w-4" />
                            저장
                          </Button>
                        </div>
                      </CardContent>
                    ) : (
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Badge>단계 {hint.stage}</Badge>
                              <Badge variant="outline">
                                {hint.wait_seconds}초 대기
                              </Badge>
                            </div>
                            <h3 className="mb-2 font-semibold">{hint.title}</h3>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap">
                              {hint.content}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingHint(hint)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => hint.id && handleDeleteHint(hint.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}

                {/* 새 힌트 생성 폼 */}
                {isCreating && editingHint && !editingHint.id && (
                  <Card className="border-2 border-primary">
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>단계</Label>
                          <Input
                            type="number"
                            value={editingHint.stage}
                            onChange={(e) =>
                              setEditingHint({
                                ...editingHint,
                                stage: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>대기 시간 (초)</Label>
                          <Input
                            type="number"
                            value={editingHint.wait_seconds}
                            onChange={(e) =>
                              setEditingHint({
                                ...editingHint,
                                wait_seconds: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>제목</Label>
                        <Input
                          value={editingHint.title}
                          onChange={(e) =>
                            setEditingHint({
                              ...editingHint,
                              title: e.target.value,
                            })
                          }
                          placeholder="힌트 제목"
                        />
                      </div>
                      <div>
                        <Label>내용</Label>
                        <Textarea
                          value={editingHint.content}
                          onChange={(e) =>
                            setEditingHint({
                              ...editingHint,
                              content: e.target.value,
                            })
                          }
                          placeholder="힌트 내용"
                          rows={5}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingHint(null);
                            setIsCreating(false);
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          취소
                        </Button>
                        <Button onClick={handleSaveHint}>
                          <Save className="mr-2 h-4 w-4" />
                          저장
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
