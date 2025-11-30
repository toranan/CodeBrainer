"use client";

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, X, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Problem {
  id: number;
  slug: string;
  title: string;
}

interface TestCase {
  id: number;
  case_no: number;
  input_path: string;
  output_path: string;
}

interface TestCaseDetail {
  case_no: number;
  input: string;
  output: string;
}

function AdminTestCasesContent() {
  const searchParams = useSearchParams();
  const initialProblemId = searchParams.get("problemId");

  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    initialProblemId || ""
  );
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<TestCaseDetail | null>(
    null
  );
  const [editingTestCase, setEditingTestCase] = useState<TestCaseDetail | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (selectedProblemId) {
      fetchTestCases(selectedProblemId);
    }
  }, [selectedProblemId]);

  const fetchProblems = async () => {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('id, slug, title')
        .order('id', { ascending: true });

      if (error) throw error;

      setProblems(data || []);
    } catch (error) {
      console.error("문제 목록 조회 실패:", error);
      toast.error("문제 목록을 불러오는데 실패했습니다");
    }
  };

  const fetchTestCases = async (problemId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('problem_tests')
        .select('*')
        .eq('problem_id', problemId)
        .order('case_no', { ascending: true });

      if (error) throw error;

      setTestCases(data || []);
      toast.success(`${data?.length || 0}개의 테스트케이스를 불러왔습니다`);
    } catch (error) {
      console.error("테스트케이스 조회 실패:", error);
      setTestCases([]);
      toast.error("테스트케이스를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestCaseDetail = async (testCase: TestCase) => {
    try {
      // Supabase Storage에서 파일 내용 가져오기 (또는 테이블에 직접 저장된 경우)
      // 여기서는 임시로 경로만 표시
      setViewingTestCase({
        case_no: testCase.case_no,
        input: `파일 경로: ${testCase.input_path}\n\n(파일 내용을 불러오려면 Supabase Storage 설정이 필요합니다)`,
        output: `파일 경로: ${testCase.output_path}\n\n(파일 내용을 불러오려면 Supabase Storage 설정이 필요합니다)`,
      });
    } catch (error) {
      console.error("테스트케이스 상세 조회 실패:", error);
      toast.error("테스트케이스 내용을 불러오는데 실패했습니다");
    }
  };

  const handleCreateTestCase = () => {
    const maxCaseNo =
      testCases.length > 0 ? Math.max(...testCases.map((tc) => tc.case_no)) : 0;

    setEditingTestCase({
      case_no: maxCaseNo + 1,
      input: "",
      output: "",
    });
    setIsCreating(true);
  };

  const handleSaveTestCase = async () => {
    if (!editingTestCase) return;

    if (!editingTestCase.input.trim() || !editingTestCase.output.trim()) {
      toast.error("입력과 출력을 모두 입력해주세요");
      return;
    }

    try {
      // 파일 경로 생성
      const problemSlug = problems.find(p => p.id.toString() === selectedProblemId)?.slug;
      const inputPath = `problems/${problemSlug}/testcase${editingTestCase.case_no}.in`;
      const outputPath = `problems/${problemSlug}/testcase${editingTestCase.case_no}.out`;

      const { error } = await supabase
        .from('problem_tests')
        .insert([{
          problem_id: parseInt(selectedProblemId),
          case_no: editingTestCase.case_no,
          input_path: inputPath,
          output_path: outputPath,
        }]);

      if (error) throw error;

      toast.success("테스트케이스가 저장되었습니다");
      toast.info("실제 입출력 파일은 Orchestrator 서버의 storage 디렉토리에 저장해야 합니다");
      
      setEditingTestCase(null);
      setIsCreating(false);
      fetchTestCases(selectedProblemId);
    } catch (error) {
      console.error("테스트케이스 저장 실패:", error);
      toast.error("테스트케이스 저장에 실패했습니다");
    }
  };

  const handleDeleteTestCase = async (testCaseId: number) => {
    if (!confirm("이 테스트케이스를 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from('problem_tests')
        .delete()
        .eq('id', testCaseId);

      if (error) throw error;

      toast.success("테스트케이스가 삭제되었습니다");
      fetchTestCases(selectedProblemId);
    } catch (error) {
      console.error("테스트케이스 삭제 실패:", error);
      toast.error("테스트케이스 삭제에 실패했습니다");
    }
  };

  const selectedProblem = problems.find(
    (p) => p.id.toString() === selectedProblemId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">테스트케이스 관리</h1>
          <p className="text-slate-600">
            문제별 입출력 테스트케이스를 관리합니다 (Supabase 직접 연동)
          </p>
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
              <Select
                value={selectedProblemId}
                onValueChange={setSelectedProblemId}
              >
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
                <Button onClick={handleCreateTestCase} disabled={isCreating}>
                  <Plus className="mr-2 h-4 w-4" />
                  테스트케이스 추가
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 테스트케이스 목록 */}
      {selectedProblemId && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedProblem?.title} - 테스트케이스 목록 ({testCases.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-slate-500">로딩 중...</p>
            ) : (
              <div className="space-y-4">
                {testCases.length === 0 && !isCreating ? (
                  <p className="text-center text-slate-500">
                    등록된 테스트케이스가 없습니다. 테스트케이스를 추가해보세요.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="pb-3 font-semibold">케이스 번호</th>
                          <th className="pb-3 font-semibold">입력 파일</th>
                          <th className="pb-3 font-semibold">출력 파일</th>
                          <th className="pb-3 font-semibold text-center">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testCases.map((testCase) => (
                          <tr key={testCase.id} className="border-b">
                            <td className="py-4">
                              <Badge>케이스 {testCase.case_no}</Badge>
                            </td>
                            <td className="py-4">
                              <code className="text-xs text-slate-600">
                                {testCase.input_path}
                              </code>
                            </td>
                            <td className="py-4">
                              <code className="text-xs text-slate-600">
                                {testCase.output_path}
                              </code>
                            </td>
                            <td className="py-4">
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => fetchTestCaseDetail(testCase)}
                                  title="경로 보기"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteTestCase(testCase.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="삭제"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 새 테스트케이스 생성 폼 */}
                {isCreating && editingTestCase && (
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle>새 테스트케이스 추가</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>케이스 번호: {editingTestCase.case_no}</Label>
                      </div>
                      <div>
                        <Label>입력 (Input)</Label>
                        <Textarea
                          value={editingTestCase.input}
                          onChange={(e) =>
                            setEditingTestCase({
                              ...editingTestCase,
                              input: e.target.value,
                            })
                          }
                          placeholder="입력 데이터를 입력하세요 (참고용, 실제 파일은 서버에 저장 필요)"
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div>
                        <Label>출력 (Output)</Label>
                        <Textarea
                          value={editingTestCase.output}
                          onChange={(e) =>
                            setEditingTestCase({
                              ...editingTestCase,
                              output: e.target.value,
                            })
                          }
                          placeholder="기대 출력을 입력하세요 (참고용, 실제 파일은 서버에 저장 필요)"
                          rows={8}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="rounded-lg bg-yellow-50 p-4">
                        <p className="text-sm text-yellow-800">
                          💡 테스트케이스 파일은 Orchestrator 서버의 `storage/problems/{'{'}{selectedProblem?.slug}{'}'}` 디렉토리에 직접 저장해야 합니다.
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingTestCase(null);
                            setIsCreating(false);
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          취소
                        </Button>
                        <Button onClick={handleSaveTestCase}>
                          <Save className="mr-2 h-4 w-4" />
                          경로만 저장
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 테스트케이스 내용 보기 모달 */}
      {viewingTestCase && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>케이스 {viewingTestCase.case_no} 경로</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingTestCase(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>입력 파일</Label>
              <Textarea
                value={viewingTestCase.input}
                readOnly
                rows={4}
                className="font-mono text-sm bg-slate-50"
              />
            </div>
            <div>
              <Label>출력 파일</Label>
              <Textarea
                value={viewingTestCase.output}
                readOnly
                rows={4}
                className="font-mono text-sm bg-slate-50"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminTestCases() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-slate-500">로딩 중...</p></div>}>
      <AdminTestCasesContent />
    </Suspense>
  );
}
