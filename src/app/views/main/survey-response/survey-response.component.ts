declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/interfaces/status';
import { SurveyService } from 'src/app/services/survey.service';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import printJS from 'node_modules/print-js/src/index.js';
import { ToastrService } from 'ngx-toastr';
import { ExportXLSX } from 'src/app/utils/export-xlsx';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-survey-response',
  templateUrl: './survey-response.component.html',
  styleUrls: ['./survey-response.component.css']
})
export class SurveyResponseComponent implements OnInit {
  survey_id: string;
  survey: any;
  surveyBody: any;

  title: string;
  modes: Array<any>;
  mode: any;
  statuses: Array<Status>;
  temp: any;
  responses: Array<any>;

  queryArray: Array<any>;
  query = '';

  p = 1;
  p1 = 1;
  p2 = 1;

  currentResponse: any;
  allResponses: any = [];
  currentQuestion: any;

  modeWatch: Observable<number>;

  constructor(private _title: Title, route: ActivatedRoute, private surveyService: SurveyService, private toastr: ToastrService,
    private exportXLSX: ExportXLSX) {
    this.modes = ['list', 'view', 'summary', 'details'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.survey_id = route.snapshot.paramMap.get('surveyId');
  }

  ngOnInit() {
    this.fetchSurveyData();
  }

  fetchSurveyData() {
    Promise.all([this.surveyService.fetchSingleSurvey(this.survey_id), this.surveyService.fetchSurveyBody(this.survey_id),
      this.surveyService.fetchResponses(this.survey_id)])
      .then((values: any[]) => {
        this.survey = values[0][0];
        this.surveyBody = values[1];
        this.title = `${this.survey.title} Responses`;
        this._title.setTitle(`Suplias - ${this.survey.title}`);
        this.responses = values[2];
        this.responses.map((response) => {
          this.allResponses.push(...response.responses);
        });
        console.log(this.allResponses);
        console.log(values[1]);
        console.log(values[2]);
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    const searchPool = this.responses;

    // set G to the value of the search bar
    const q = this.query;

    // if value is empty, don't filter items
    if (!q) {
      return;
    }

    this.queryArray = searchPool.filter((v) => {
      if (v.name && q) {
        if (v.name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  setMode(index: number): void {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
  }

  closeView() {
    this.setMode(0);
    this.currentResponse = null;
  }

  print() {
    document.getElementById('printable').hidden = false;
    printJS({printable: 'printable', type: 'html'});
    document.getElementById('printable').hidden = true;
  }

  printResponse() {
    document.getElementById('single').hidden = false;
    printJS({printable: 'single', type: 'html'});
    document.getElementById('single').hidden = true;
  }

  viewResponse(response: any) {
    this.currentResponse = response;
    this.setMode(1);
  }

  getQuestion(question_id: string) {
    return this.surveyBody.find((question) => question._id === question_id);
  }

  viewSummary() {
    this.setMode(2);
  }

  closeDetails(index: number) {
    this.currentQuestion = null;
    this.setMode(index);
  }

  viewDetails(question: any) {
    this.currentQuestion = question;
    this.setMode(3);
  }

  fetchPercentage(questionId: string, choices: any[], op: string, choice_id?: string) {
    const responses = this.allResponses.filter((response) => response.question_id === questionId);
    const percentages = [];
    choices.map((choice) => {
      const count = responses.filter((response) => response.title === choice._id).length;
      percentages.push({ choice: choice._id, percent: ((count / responses.length) * 100)});
    });
    if (op === 'all') {
      return percentages.sort(function(a, b) {
        const A = a.percent, B = b.percent;
        if (A < B) {
          return -1;
        }
        if (A > B) {
          return 1;
        }
        return 0;
      });
    } else {
      return percentages.find((percent) => percent.choice === choice_id).percent;
    }
  }

  fetchResponses(question_id: string, question_type: string, choices: any[]) {
    const responses = this.responses.filter((response) =>
      response.responses.findIndex((_response) => _response.question_id === question_id) > -1);
    const questionResponses = [];
    responses.map((response_) => {
      const response = response_.responses.find((_response) => _response.question_id === question_id);
      let answer;
      question_type === 'question' ? answer = response.title : answer = choices.find((choice) => choice._id === response.title).title;

      questionResponses.push({ name: response_.name, store: response_.store, phone: response_.phone, answer });
    });
    return questionResponses.sort((a, b) => {
      const A = a.name.toLowerCase(), B = b.name.toLowerCase();
      if (A < B) {
        return -1;
      }
      if (A > B) {
        return 1;
      }
      return 0;
    });
  }

  //#region Util methods
    getQuestionAnswer(question: any, responses) {
      let answer;
      const response = responses.find((res) => res.question_id === question._id);

      if (response) {
        if (question.type === 'question') {
          answer = response.title;
        } else {
          const ans = question.choices.find((choice) => choice._id === response.title);
          ans ? answer = ans.title : answer = '-';
        }
      } else {
        answer = '-';
      }
      return answer;
    }

    exportToXLSX(title: string, table: string) {
      const html = document.getElementById(table);
      this.exportXLSX.exportAsXLSX(html, `${this._title.getTitle()} - ${title}`);
    }
  //#endregion
}
