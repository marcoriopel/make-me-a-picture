import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { formatDateString } from '@app/classes/date';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {

  constructor(private http: HttpClient) { }
  private baseUrl = environment.api_url;
  private getFeedImagesUrl = this.baseUrl + '/api/drawings/feed/info'
  feed: any[] = []

  ngOnInit(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem('token')!
    });
    const options = { headers: headers };
    this.http.get<any>(this.getFeedImagesUrl, options)
      .subscribe((data: any) => {
        data.feedInfo.forEach((image: any) => {
          image.url = 'https://drawingimages.s3.us-east-2.amazonaws.com/' + image.id + '.png';
          image.timestamp = formatDateString(image.timestamp);
        })
        this.feed = data.feedInfo.reverse();
      });
  }
}
