package com.project1.emailWriter.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project1.emailWriter.Model.EmailRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;


import java.util.Map;
import java.util.Objects;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    // public String generateEmailReply(EmailRequest emailRequest){
    //     //1)Build a prompt
    //     String prompt=buildPrompt(emailRequest);

    //     //2)Crafting a request
    //     Map<String, Object> requestBody=Map.of(
    //           "contents",new Object[]{
    //               Map.of("parts",new Object[]{
    //                       Map.of("text",prompt)
    //               })
    //             }
    //     );

    //     //3)Do request and get response
    //     String response=webClient.post()
    //             .uri(geminiApiUrl+geminiApiKey)
    //             .header("Content-Type","application/json")
    //             .bodyValue(requestBody)
    //             .retrieve()

    //             .bodyToMono(String.class)
    //             .block();


    //     //Extract the reply and return it

    //     return extractResponseContent(response) ;
    // }
   public String generateEmailReply(EmailRequest emailRequest){
    String prompt = buildPrompt(emailRequest);

    Map<String, Object> requestBody = Map.of(
            "contents", new Object[]{
                    Map.of("parts", new Object[]{
                            Map.of("text", prompt)
                    })
            }
    );

    String response = webClient.post()
            .uri(uriBuilder -> uriBuilder
                    .path(geminiApiUrl)
                    .queryParam("key", geminiApiKey)
                    .build())
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .block();

    return extractResponseContent(response);
}


    private String extractResponseContent(String response) {
        try{
            ObjectMapper mapper=new ObjectMapper();
            JsonNode rootNode=mapper.readTree(response);
            return rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        }catch(Exception e){
            return e.getMessage();

        }

    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply to the following email content without generating a subject line. ");

        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("The response should be written in a ")
                    .append(emailRequest.getTone().toLowerCase())  // lowercase makes it feel natural
                    .append(" tone. ");
        }

        prompt.append("\n\nOriginal email:\n")
                .append(emailRequest.getEmailContent());

        return prompt.toString();
    }

}
